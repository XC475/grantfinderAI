import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os
import sys
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, OpportunityStatusEnum
import re
from datetime import date, timedelta

# --- Flask app context setup ---
flask_app = server.create_app()

def parse_date(date_str):
    if not date_str:
        return None
    # Try multiple formats
    for fmt in ("%m/%d/%Y", "%B %d, %Y", "%A, %B %d, %Y", "%A, %B %e, %Y", "%A, %B %d, %Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except Exception:
            continue
    # Remove weekday prefix and try again
    if ',' in date_str:
        try:
            return datetime.strptime(date_str.split(',',1)[-1].strip(), "%B %d, %Y").date()
        except Exception:
            pass
    try:
        return datetime.strptime(date_str, "%m/%d/%Y").date()
    except Exception:
        return None

def ai_extract_data(details, current_opportunity):
    """Extract relevant data from the scraped details using AI techniques."""
    # Placeholder for AI extraction logic
    # This could involve using NLP models to identify and extract key information
    """
    Send scraped grant data to OpenRouter for parsing and processing.
    """
    prompt = f"""
        You are an AI agent specialized in processing grant data from the Massachusetts Department of Education grants website. You will be given a partially populated grant object along with the full details content. Your task is to extract, summarize, and organize key information into a structured JSON object.

        The data to process is as follows, be sure to try to extract more relevant details from links that are given:
        {details}

        The current partially loaded context is:
        {current_opportunity}

        Instructions:
        - Summarize the grant description in a clear and easily understandable way in the field 'description_summary'.
        - Summarize the eligibility requirements in a clear and easily understandable way in the field 'eligibility_summary' and capture any specific criteria or conditions.
        - Extract numeric values for award_min, award_max, and total_funding_amount as integers only, if available, otherwise return "None" for those fields.
        - Include contact details if available: contact_name and contact_phone, if not return "None" for those fields.
        - Include any links attachments or related documents in the 'attachments' JSON object with 'name' and 'url' which includes the attachment name and the url link.
        - Include any additional relevant information not captured above in the 'extra' field as a JSON object.
        - Never make up information, if it is not present in the details, return "None" for that field, do not use "null".
        - Ensure the output is valid JSON that can be parsed directly.

        Return ONLY a JSON object with the following keys:
        - description_summary
        - eligibility_summary
        - award_min
        - award_max
        - total_funding_amount
        - contact_name
        - contact_phone
        - attachments
        - extra
    """
    try:
        response = client.chat.completions.create(
            model="google/gemini-2.5-flash-preview-09-2025",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error communicating with OpenRouter: {e}")
        return None

def upsert_mass_dese_grant(grant, session):
    """Upsert a single grant from the Mass DESE grants table."""

    # Handle multiple fund codes separated by '/' or ',' or ';'
    fund_code_raw = grant[0]
    if len(fund_code_raw) > 4:
        # Split on '/', ',', or ';'
        fund_codes = [fc.strip() for fc in re.split(r'[/,;]', fund_code_raw) if fc.strip()]
        fund_code = '-'.join(fund_codes)
    else:
        fund_code = fund_code_raw.strip()
    program_name = grant[1]
    date_posted = parse_date(grant[2])
    date_due = parse_date(grant[3])
    grant_type = grant[4]
    funding_type = grant[5]
    program_unit = grant[6]
    contact = grant[7]

    # Parse fiscal year from program_name (expects it starts with 'FY26' or similar)
    fiscal_year = None
    if program_name.startswith('FY') and len(program_name) >= 4:
        try:
            # Handles 'FY26', 'FY2026', etc.
            fy_part = program_name[2:6]
            if fy_part.isdigit():
                fiscal_year = int(fy_part)
            elif fy_part[:2].isdigit():
                # e.g., 'FY26...' -> 2026
                fiscal_year = 2000 + int(fy_part[:2])
        except Exception:
            fiscal_year = None

    # --- Agency ---
    agency_name = program_unit.strip() if program_unit else None

    # --- Opportunity ---
    opportunity = session.query(Opportunity).filter_by(source_grant_id=fund_code, source="doe.mass.edu").first()
    if not opportunity:
        opportunity = Opportunity(source_grant_id=fund_code, source="doe.mass.edu", state_code="MA", status=OpportunityStatusEnum.posted, title=program_name)
        session.add(opportunity)

    opportunity.category = grant_type
    opportunity.post_date = date_posted
    opportunity.close_date = date_due
    opportunity.contact_email = contact
    opportunity.fiscal_year = fiscal_year
    url =  f"https://www.doe.mass.edu/grants/{fiscal_year}/{fund_code}" if fiscal_year else None
    opportunity.url = url
    opportunity.status = OpportunityStatusEnum.posted
    opportunity.contact_email = contact
    opportunity.agency = agency_name
    opportunity.funding_instrument = "grant"

    if not url:
        return

    # Parse additional details from the grant page
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    last_updated_element = soup.find("p", id="last-updated-date")
    
    # Parse last updated date label
    if last_updated_element:
        last_updated_text = last_updated_element.get_text(strip=True).replace("Last Updated:", "").strip()
        parsed_last_updated = parse_date(last_updated_text)
        
        last_updated_date = opportunity.last_updated.date() if hasattr(opportunity.last_updated, 'date') else opportunity.last_updated
        if last_updated_date and last_updated_date == parsed_last_updated:
            print(f"Skipping {opportunity.source_grant_id}, no update.")
            return  # Skip this grant
        opportunity.last_updated = parsed_last_updated

    dl = soup.find("dl")
    if dl:
        dt_tags = dl.find_all("dt")
        dd_tags = dl.find_all("dd")
        details = {}
        for dt, dd in zip(dt_tags, dd_tags):
            key = dt.get_text(strip=True)
            # If the dd contains links, append their URLs in parentheses after the text
            links = dd.find_all("a", href=True)
            text = dd.get_text(strip=True)
            link_texts = []
            if links:
                link_texts = [f"{a.get_text(strip=True)} ({a['href']})" for a in links]
            # If the text doesn't already include the link text, append it
            if text:
                text += " " + " ".join(link_texts)
            else:
                text = " ".join(link_texts)
            details[key] = text

        # Map details to Opportunity fields
        opportunity.eligibility = details.get('Eligibility:', opportunity.eligibility)
        opportunity.description = details.get('Purpose:', opportunity.description)
    
    ai_extract_data_result = ai_extract_data(details, {
        "grant_id": opportunity.source_grant_id,
        "title": opportunity.title,
        "description": opportunity.description,
        "agency": opportunity.agency,
        "post_date": str(opportunity.post_date),
        "close_date": str(opportunity.close_date),
        "fiscal_year": opportunity.fiscal_year,
        "contact_email": opportunity.contact_email,
    })

    # strip ```json ... ``` if present
    if ai_extract_data_result and ai_extract_data_result.startswith("```json"):
        ai_extract_data_result = ai_extract_data_result.replace("```json", "").replace("```", "").strip()

    print(f"AI Extracted Data: {ai_extract_data_result}")

    if ai_extract_data_result:
        try:
            ai_data = eval(ai_extract_data_result)  # Use eval to parse the JSON-like string
            if 'description_summary' in ai_data:
                opportunity.description_summary = ai_data['description_summary']
            if 'eligibility_summary' in ai_data:
                opportunity.eligibility_summary = ai_data['eligibility_summary']
            if 'award_min' in ai_data:
                opportunity.award_min = int(ai_data['award_min']) if ai_data['award_min'] != "None" else None
            if 'award_max' in ai_data:
                opportunity.award_max = int(ai_data['award_max']) if ai_data['award_max'] != "None" else None
            if 'total_funding_amount' in ai_data:
                opportunity.total_funding_amount = int(ai_data['total_funding_amount']) if ai_data['total_funding_amount'] != "None" else None
            if 'contact_name' in ai_data:
                opportunity.contact_name = ai_data['contact_name']
            if 'contact_phone' in ai_data:
                opportunity.contact_phone = ai_data['contact_phone']
            if 'attachments' in ai_data:
                opportunity.attachments = ai_data['attachments']
            if 'extra' in ai_data:
                opportunity.extra = ai_data['extra']
        except Exception as e:
            print(f"Error parsing AI extracted data: {e}")

    print(f"Upserting opportunity {opportunity.source_grant_id} - {opportunity.title}")
    session.add(opportunity)


def main():
    url = "https://www.doe.mass.edu/grants/current.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    table = soup.find("table", id="ctl00_ctl00_ContentPlaceHolder1_cphMain_GridViewDateDue")
    rows = table.find_all("tr")

    header = None
    grants = []
    for i, row in enumerate(rows):
        cells = row.find_all(["td", "th"])
        cell_text = [cell.get_text(strip=True) for cell in cells]
        if i == 0:
            header = cell_text
            continue
        if not cell_text or len(cell_text) < 8:
            continue
        grants.append(cell_text)

    with flask_app.app_context():
        session = db.session
        current_opportunity_numbers = set()
        for grant in grants:
            # Compute fund_code as in upsert_mass_dese_grant
            fund_code_raw = grant[0]
            if len(fund_code_raw) > 4:
                fund_codes = [fc.strip() for fc in re.split(r'[/,;]', fund_code_raw) if fc.strip()]
                fund_code = '-'.join(fund_codes)
            else:
                fund_code = fund_code_raw.strip()
            current_opportunity_numbers.add(fund_code)
            upsert_mass_dese_grant(grant, session)

        # Mark stale grants as closed if their close_date is today or earlier
        stale_grants = session.query(Opportunity).filter(
            Opportunity.source == "doe.mass.edu",
            Opportunity.status == OpportunityStatusEnum.posted,
            ~Opportunity.source_grant_id.in_(current_opportunity_numbers)
        ).all()
        for opp in stale_grants:
            if opp.close_date and opp.close_date <= date.today():
                opp.status = OpportunityStatusEnum.closed
                print(f"Marked stale grant as closed: {opp.source_grant_id} - {opp.title}")
        session.commit()

if __name__ == "__main__":
    main()