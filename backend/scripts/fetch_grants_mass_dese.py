"""backend/scripts/fetch_grants_mass_dese.py
Script to fetch and process grants from the Massachusetts Department of Education website."""

import os
import sys
import re
from datetime import date
import json

import requests
from bs4 import BeautifulSoup
import helpers

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, OpportunityStatusEnum, FundingTypeEnum

# Flask app context setup
flask_app = server.create_app()


def get_batch_prompt(grants_batch):
    """Generate the prompt for batch AI extraction based on multiple Mass DESE grant details."""
    batch_json = json.dumps(grants_batch, indent=2)
    grant_count = len(grants_batch)

    prompt = f"""
IMPORTANT: You MUST return ONLY a valid JSON array. Do not include any explanatory text, comments, or additional information.

You are processing {grant_count} Massachusetts DESE grants. For each grant, extract key information into a JSON object.

Input data:
{batch_json}

CRITICAL INSTRUCTIONS:
1. Return ONLY a JSON array starting with [ and ending with ]
2. No explanatory text before or after the JSON
3. No comments or additional information
4. Process each grant in the exact order provided

For each grant, create an object with these exact fields:
- index: The grant's position (0, 1, 2, etc.)
- description_summary: Brief summary of grant purpose
- eligibility_summary: Who can apply (focus on MA school districts)
- award_min: Minimum award as integer or null
- award_max: Maximum award as integer or null  
- total_funding_amount: Total program funding as integer or null
- contact_name: Contact person or null
- contact_phone: Phone number or null
- attachments: Array of {{"name": "...", "url": "..."}} objects
- extra: Additional relevant details as JSON object

REQUIRED OUTPUT FORMAT (no other text):
[
  {{
    "index": 0,
    "description_summary": "Brief grant description",
    "eligibility_summary": "Who can apply",
    "award_min": null,
    "award_max": 50000,
    "total_funding_amount": null,
    "contact_name": null,
    "contact_phone": null,
    "attachments": [],
    "extra": {{}}
  }},
  {{
    "index": 1,
    "description_summary": "Brief grant description",
    "eligibility_summary": "Who can apply",
    "award_min": 10000,
    "award_max": null,
    "total_funding_amount": 100000,
    "contact_name": "John Doe",
    "contact_phone": null,
    "attachments": [{{"name": "Guidelines", "url": "https://example.com"}}],
    "extra": {{"deadline_note": "Applications due by 5 PM"}}
  }}
]
    """
    return prompt


def batch_process_grants_with_ai(grants_data):
    """Process multiple Mass DESE grants in a single AI API call for efficiency."""
    if not grants_data:
        return []

    try:
        print(f"Processing batch of {len(grants_data)} Mass DESE grants with AI")
        model = "google/gemini-2.5-flash-preview-09-2025:online"
        ai_response = helpers.ai_extract_data(get_batch_prompt(grants_data), model)

        if not ai_response:
            print("No response from AI")
            return []

        # Debug: Show first 200 chars of AI response
        print(f"AI response preview: {ai_response[:200]}...")

        # Clean the response - strip ```json ... ``` if present
        if ai_response.startswith("```json"):
            ai_response = ai_response.replace("```json", "").replace("```", "").strip()

        # Check if the response starts with '[' (proper JSON array)
        if ai_response.strip().startswith("["):
            json_portion = ai_response.strip()
            print("✅ AI response appears to be a valid JSON array")
        else:
            # More aggressive cleaning - look for JSON array pattern
            # Remove any text before the first '[' and after the last ']'
            start = ai_response.find("[")
            end = ai_response.rfind("]")

            if start == -1:
                print(
                    "❌ AI response does not contain a JSON array starting bracket '['"
                )
                print("Response type: AI returned explanatory text instead of JSON")
                print(f"First 500 chars: {ai_response[:500]}...")
                return []

            if end == -1 or end <= start:
                print(
                    "❌ AI response does not contain a valid JSON array ending bracket ']'"
                )
                print(f"Start position: {start}, End position: {end}")
                return []

            # Extract the JSON array portion
            json_portion = ai_response[start : end + 1]
            print(f"⚠️  Extracted JSON from mixed response (chars {start}-{end})")

        print(f"JSON portion preview: {json_portion[:200]}...")

        # Additional validation - check if it looks like valid JSON
        if not json_portion.strip().startswith(
            "["
        ) or not json_portion.strip().endswith("]"):
            print("Extracted portion doesn't look like a valid JSON array")
            return []

        processed_grants = json.loads(json_portion)

        if not isinstance(processed_grants, list):
            print("AI response is not a list")
            return []

        print(
            f"Successfully processed {len(processed_grants)} Mass DESE grants with AI"
        )
        return processed_grants

    except json.JSONDecodeError as e:
        print(f"Error parsing AI response as JSON: {e}")
        print(f"AI response was: {ai_response[:500]}...")
        return []
    except Exception as e:
        print(f"Error in AI processing: {e}")
        return []


def process_mass_dese_grants_individually(grants_data):
    """Process Mass DESE grants individually when batch processing fails."""
    if not grants_data:
        return []

    print(f"Processing {len(grants_data)} Mass DESE grants individually as fallback...")
    results = []
    model = "google/gemini-2.5-flash-preview-09-2025:online"

    for i, grant_data in enumerate(grants_data):
        try:
            # Create individual prompt for single grant
            individual_prompt = f"""
                You are an AI agent specialized in processing grant data from the Massachusetts Department of Education grants website.
                Extract and organize key information from this single grant into a structured JSON object.
                
                Grant data:
                {json.dumps(grant_data, indent=2)}
                
                Instructions:
                - description_summary: Concise, plain-language summary of the grant's purpose and what it funds
                - eligibility_summary: Summarize eligibility requirements in clear English  
                - award_min: Minimum award amount as integer, otherwise null
                - award_max: Maximum award amount as integer, otherwise null
                - total_funding_amount: Total program funding as integer, otherwise null
                - contact_name: Contact person name if available, otherwise null
                - contact_phone: Contact phone number if available, otherwise null
                - attachments: Array of objects with 'name' and 'url' for any links/documents
                - extra: Any other important details as a structured JSON object
                
                Return ONLY a JSON object (not an array) with these keys:
                {{
                    "index": {i},
                    "description_summary": "...",
                    "eligibility_summary": "...",
                    "award_min": null,
                    "award_max": 50000,
                    "total_funding_amount": null,
                    "contact_name": null,
                    "contact_phone": null,
                    "attachments": [],
                    "extra": {{}}
                }}
            """

            ai_response = helpers.ai_extract_data(individual_prompt, model)

            if ai_response:
                # Clean response
                if ai_response.startswith("```json"):
                    ai_response = (
                        ai_response.replace("```json", "").replace("```", "").strip()
                    )

                individual_result = json.loads(ai_response)
                individual_result["index"] = i  # Ensure correct index
                results.append(individual_result)
                print(
                    f"  Processed grant {i+1}/{len(grants_data)}: {grant_data.get('grant_id', 'Unknown')}"
                )
            else:
                print(
                    f"  Failed to process grant {i+1}: {grant_data.get('grant_id', 'Unknown')}"
                )

        except Exception as e:
            print(f"  Error processing individual grant {i+1}: {e}")
            continue

    print(
        f"Individual processing completed: {len(results)}/{len(grants_data)} grants processed"
    )
    return results


def prepare_mass_dese_grant(grant, session, fund_code):
    """Prepare a Mass DESE grant for batch processing."""
    # Basic scraped fields from main grants table
    program_name = grant[1]
    date_posted = helpers.parse_date(grant[2])
    date_due = helpers.parse_date(grant[3])
    grant_type = grant[4]
    program_unit = grant[6]
    contact = grant[7]

    # Parse fiscal year from program_name (expects it starts with 'FY26' or similar)
    fiscal_year = None
    if program_name.startswith("FY") and len(program_name) >= 4:
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

    # Extract agency name from program_unit
    agency_name = program_unit.strip() if program_unit else None

    # Initialize or update the Opportunity record
    opportunity = (
        session.query(Opportunity)
        .filter_by(source_grant_id=fund_code, source="doe.mass.edu")
        .first()
    )
    if not opportunity:
        opportunity = Opportunity(
            source_grant_id=fund_code,
            source="doe.mass.edu",
            state_code="MA",
            status=OpportunityStatusEnum.posted,
            title=program_name,
        )
        session.add(opportunity)

    # Assign basic fields to opportunity record
    opportunity.category = grant_type
    opportunity.post_date = date_posted
    opportunity.close_date = date_due
    opportunity.contact_email = contact
    opportunity.fiscal_year = fiscal_year
    opportunity.status = OpportunityStatusEnum.posted
    opportunity.contact_email = contact
    opportunity.agency = agency_name
    opportunity.funding_instrument = "Grant"
    opportunity.funding_type = FundingTypeEnum.state
    opportunity.relevance_score = 100

    # Construct URL to the detailed grant page
    url = (
        f"https://www.doe.mass.edu/grants/{fiscal_year}/{fund_code}"
        if fiscal_year
        else None
    )
    opportunity.url = url

    if not url:
        return None

    # Parse additional details from the grant page
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        # Parse last updated date label
        last_updated_element = soup.find("p", id="last-updated-date")

        if last_updated_element:
            # Parse last updated date
            last_updated_text = (
                last_updated_element.get_text(strip=True)
                .replace("Last Updated:", "")
                .strip()
            )
            parsed_last_updated = helpers.parse_date(last_updated_text)

            # If last_updated hasn't changed, skip further processing
            last_updated_date = (
                opportunity.last_updated.date()
                if hasattr(opportunity.last_updated, "date")
                else opportunity.last_updated
            )
            if last_updated_date and last_updated_date == parsed_last_updated:
                print(f"Skipping {opportunity.source_grant_id}, no update.")
                return None

            opportunity.last_updated = parsed_last_updated

        # Parse main details from table
        details = {}
        dl = soup.find("dl")
        if dl:
            dt_tags = dl.find_all("dt")
            dd_tags = dl.find_all("dd")
            for dt, dd in zip(dt_tags, dd_tags):
                key = dt.get_text(strip=True)

                # If the dd contains links, append their URLs in parentheses after the text for model context
                links = dd.find_all("a", href=True)
                text = dd.get_text(strip=True)

                link_texts = []
                if links:
                    link_texts = []
                    for a in links:
                        href = a["href"]
                        # Skip mailto links
                        if href.startswith("mailto:"):
                            continue
                        # If the link begins with a slash, prepend the base URL
                        if href.startswith("/"):
                            href = f"https://doe.mass.edu{href}"
                        link_texts.append(f"{a.get_text(strip=True)} ({href})")

                # If the text doesn't already include the link text, append it
                if text:
                    text += " " + " ".join(link_texts)
                else:
                    text = " ".join(link_texts)

                details[key] = text

            # Map raw eligibility and description to Opportunity fields
            opportunity.eligibility = details.get(
                "Eligibility:", opportunity.eligibility
            )
            opportunity.description = details.get("Purpose:", opportunity.description)

    except Exception as e:
        print(f"Error fetching details for {fund_code}: {e}")
        details = {}

    # Prepare grant data for batch processing
    grant_data = {
        "index": 0,  # Will be set during batch processing
        "grant_id": opportunity.source_grant_id,
        "title": opportunity.title,
        "description": opportunity.description,
        "agency": opportunity.agency,
        "post_date": str(opportunity.post_date),
        "close_date": str(opportunity.close_date),
        "fiscal_year": opportunity.fiscal_year,
        "contact_email": opportunity.contact_email,
        "category": opportunity.category,
        "eligibility": opportunity.eligibility,
        "details": details,  # Include all parsed details for AI processing
        "url": opportunity.url,
    }

    return {"opportunity": opportunity, "grant_data": grant_data}


def apply_ai_results_to_mass_dese_opportunity(opportunity, ai_data):
    """Apply AI processing results to a Mass DESE opportunity object."""
    try:
        if "description_summary" in ai_data:
            opportunity.description_summary = ai_data["description_summary"]
        if "eligibility_summary" in ai_data:
            opportunity.eligibility_summary = ai_data["eligibility_summary"]
        if "award_min" in ai_data:
            opportunity.award_min = (
                int(ai_data["award_min"]) if ai_data["award_min"] is not None else None
            )
        if "award_max" in ai_data:
            opportunity.award_max = (
                int(ai_data["award_max"]) if ai_data["award_max"] is not None else None
            )
        if "total_funding_amount" in ai_data:
            opportunity.total_funding_amount = (
                int(ai_data["total_funding_amount"])
                if ai_data["total_funding_amount"] is not None
                else None
            )
        if "contact_name" in ai_data:
            opportunity.contact_name = ai_data["contact_name"]
        if "contact_phone" in ai_data:
            opportunity.contact_phone = ai_data["contact_phone"]
        if "attachments" in ai_data:
            opportunity.attachments = ai_data["attachments"]
        if "extra" in ai_data:
            opportunity.extra = ai_data["extra"]

        # Generate and populate raw_text using the helper function
        opportunity.raw_text = helpers.format_opportunity_text(opportunity)

        return True
    except Exception as e:
        print(f"Error applying AI results to Mass DESE opportunity: {e}")
        return False


def process_mass_dese_batch(batch, session):
    """Process a batch of Mass DESE grants with AI and update the database."""
    if not batch:
        return 0

    print(f"Processing batch of {len(batch)} Mass DESE grants...")

    # Prepare batch data for AI processing
    batch_data = []
    for j, grant_info in enumerate(batch):
        grant_data = grant_info["grant_data"].copy()
        grant_data["index"] = j
        batch_data.append(grant_data)

    # Try batch processing first
    processed_grants = batch_process_grants_with_ai(batch_data)

    # If batch processing failed, try individual processing
    if not processed_grants:
        print("Batch processing failed, falling back to individual processing...")
        processed_grants = process_mass_dese_grants_individually(batch_data)

    if not processed_grants:
        print("Both batch and individual processing failed for this batch")
        return 0

    # Apply AI results to opportunities and commit
    updated_count = 0
    for j, ai_result in enumerate(processed_grants):
        if j < len(batch):
            grant_info = batch[j]
            opportunity = grant_info["opportunity"]

            if apply_ai_results_to_mass_dese_opportunity(opportunity, ai_result):
                session.commit()
                print(f"Upserted {opportunity.source_grant_id}: {opportunity.title}")
                updated_count += 1
            else:
                session.rollback()

    return updated_count


def calculate_fund_code(fund_code_raw):
    """Calculate the fund code from the raw input."""
    if len(fund_code_raw) > 4:
        # Split on '/', ',', or ';'
        fund_codes = [
            fc.strip() for fc in re.split(r"[/,;]", fund_code_raw) if fc.strip()
        ]
        return "-".join(fund_codes)
    return fund_code_raw.strip()


def main():
    # Fetch the main grants listing page
    url = "https://www.doe.mass.edu/grants/current.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Parse the grants table
    table = soup.find(
        "table", id="ctl00_ctl00_ContentPlaceHolder1_cphMain_GridViewDateDue"
    )
    rows = table.find_all("tr")

    # Collect all grants from the table
    grants = []
    for i, row in enumerate(rows):
        cells = row.find_all(["td", "th"])
        cell_text = [cell.get_text(strip=True) for cell in cells]
        if i == 0:  # Skip the header row
            continue

        if not cell_text or len(cell_text) < 8:
            continue
        grants.append(cell_text)

    # Process grants in batches of 5 as soon as they're ready
    with flask_app.app_context():
        session = db.session
        current_fund_codes = set()
        batch_size = 5
        current_batch = []
        updated_count = 0

        for grant in grants:
            # Compute fund_code as in prepare_mass_dese_grant
            fund_code_raw = grant[0]
            fund_code = calculate_fund_code(fund_code_raw)
            current_fund_codes.add(fund_code)

            # Prepare the grant for batch processing
            prepared_grant = prepare_mass_dese_grant(grant, session, fund_code)

            if prepared_grant:  # Only add if not skipped
                current_batch.append(prepared_grant)

                # Process batch when it reaches the batch size
                if len(current_batch) >= batch_size:
                    updated_count += process_mass_dese_batch(current_batch, session)
                    current_batch = []  # Reset batch

        # Process any remaining grants in the final batch
        if current_batch:
            updated_count += process_mass_dese_batch(current_batch, session)

        print(f"Successfully processed {updated_count} Mass DESE grants with AI")

        # Mark stale grants as closed if their close_date is today or earlier
        stale_grants = (
            session.query(Opportunity)
            .filter(
                Opportunity.source == "doe.mass.edu",
                Opportunity.status == OpportunityStatusEnum.posted,
                ~Opportunity.source_grant_id.in_(current_fund_codes),
            )
            .all()
        )

        for opp in stale_grants:
            if opp.close_date and opp.close_date <= date.today():
                opp.status = OpportunityStatusEnum.closed
                print(
                    f"Marked stale grant as closed: {opp.source_grant_id} - {opp.title}"
                )
        session.commit()


if __name__ == "__main__":
    main()
