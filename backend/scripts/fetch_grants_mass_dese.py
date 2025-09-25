import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, Agency, OpportunityStatusEnum
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

    
def extract_funding_amount(text):
    if not text:
        return None
    # Look for patterns like $80,000 or $1,234,567.89
    match = re.search(r'\$([\d,]+(?:\.\d{1,2})?)', text)
    if match:
        amount_str = match.group(1).replace(',', '')
        if '.' in amount_str:
            return int(float(amount_str))
        return int(amount_str)
    return None


def upsert_mass_dese_grant(grant, session):
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
    date_due = parse_date(grant[3].replace('Friday, ', '').replace('Tuesday, ', ''))
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
    agency_code = program_unit.strip().lower().replace(' ', '_').replace(',', '')[:32] if program_unit else None
    agency_name = program_unit.strip() if program_unit else None
    agency = None
    if agency_code:
        agency = session.query(Agency).filter_by(code=agency_code, source="doe.mass.edu").first()
        if not agency:
            agency = Agency(code=agency_code, name=agency_name, source="doe.mass.edu")
            session.add(agency)

    # --- Opportunity ---
    opportunity = session.query(Opportunity).filter_by(opportunity_number=fund_code, source="doe.mass.edu").first()
    if not opportunity:
        opportunity = Opportunity(opportunity_number=fund_code, source="doe.mass.edu", state_code="MA", status=OpportunityStatusEnum.posted, title=program_name)
        session.add(opportunity)

    opportunity.category = grant_type
    opportunity.post_date = date_posted
    opportunity.close_date = date_due
    opportunity.contact_email = contact
    opportunity.fiscal_year = fiscal_year
    url =  f"https://www.doe.mass.edu/grants/{fiscal_year}/{fund_code}" if fiscal_year else None
    opportunity.url = url
    opportunity.status = OpportunityStatusEnum.posted
    if agency:
        opportunity.agencies = [agency]

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
            print(f"Skipping {opportunity.opportunity_number}, no update.")
            return  # Skip this grant
        opportunity.last_updated = parsed_last_updated

    dl = soup.find("dl")
    if dl:
        dt_tags = dl.find_all("dt")
        dd_tags = dl.find_all("dd")
        details = {dt.get_text(strip=True): dd.get_text(strip=True) for dt, dd in zip(dt_tags, dd_tags)}

        # Map details to Opportunity fields
        opportunity.eligibility = details.get('Eligibility:', opportunity.eligibility)
        opportunity.description = details.get('Purpose:', opportunity.description)
        # Clean up contact_name: remove emails, phone numbers, and extra whitespace
        raw_contact = details.get('Contact:', opportunity.contact_name)
        if raw_contact:
            # Remove emails
            cleaned = re.sub(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', '', raw_contact)
            # Extract phone numbers (formats like 781-338-3525, (781) 338-3525, 781.338.3525, etc.)
            phone_matches = re.findall(r'(\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{4})', cleaned)
            # Remove phone numbers from contact_name
            cleaned = re.sub(r'(\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{4})', '', cleaned)
            # Remove "or" followed by phone
            cleaned = re.sub(r'or\s+\d{3}[\s\.-]?\d{3}[\s\.-]?\d{4}', '', cleaned, flags=re.IGNORECASE)
            # Remove "contact:" and similar phrases
            cleaned = re.sub(r'for submission.*?contact:', '', cleaned, flags=re.IGNORECASE)
            # Remove extra whitespace and stray punctuation
            cleaned = re.sub(r'[;,]+', ',', cleaned)
            cleaned = re.sub(r'\s+', ' ', cleaned).strip(' ,;')
            opportunity.contact_name = cleaned if cleaned else None
            # Set contact_phone to the extracted phone numbers, joined by comma if multiple
            opportunity.contact_phone = ', '.join(phone_matches) if phone_matches else None
        else:
            opportunity.contact_name = None
            opportunity.contact_phone = None

        opportunity.contact_phone = details.get('Phone Number:', opportunity.contact_phone)
        opportunity.total_funding_amount = extract_funding_amount(details.get('Funding:', opportunity.total_funding_amount))
    
    print(f"Upserting opportunity {opportunity.opportunity_number} - {opportunity.title}")
    session.add(opportunity)


def main():
    url = "https://www.doe.mass.edu/grants/current.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    last_updated_element = soup.find("p", id="last-updated-date")
    
    # Parse last updated date label, skip update if main page not updated in last 3 days
    if last_updated_element:
        last_updated_text = last_updated_element.get_text(strip=True).replace("Last Updated:", "").strip()
        last_updated_date = parse_date(last_updated_text)
        
        if not last_updated_date or abs((date.today() - last_updated_date).days) > 4:
            print(f"Skipping update: last updated date {last_updated_date} is not within 3 days of today.")
            return
    
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
            ~Opportunity.opportunity_number.in_(current_opportunity_numbers)
        ).all()
        for opp in stale_grants:
            if opp.close_date and opp.close_date <= date.today():
                opp.status = OpportunityStatusEnum.closed
                print(f"Marked stale grant as closed: {opp.opportunity_number} - {opp.title}")
        session.commit()

if __name__ == "__main__":
    main()