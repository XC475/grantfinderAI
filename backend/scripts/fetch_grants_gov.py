"""backend/scripts/fetch_grants_gov.py
Fetch and process grant opportunities from grants.gov API.
"""

import requests
from datetime import date
import os
import sys
import helpers

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, OpportunityStatusEnum, FundingTypeEnum
import json

# App + API setup
flask_app = server.create_app()
HEADERS = {"Content-Type": "application/json"}
SEARCH_URL = "https://api.grants.gov/v1/api/search2"
FETCH_URL = "https://api.grants.gov/v1/api/fetchOpportunity"
model = "google/gemini-2.5-flash-preview-09-2025:online"


def should_skip_grant(close_date, fiscal_year):
    """
    Determine if a grant should be skipped based on close_date and fiscal_year criteria.

    Args:
        close_date: The grant's close/deadline date (can be None)
        fiscal_year: The grant's fiscal year (can be None)

    Returns:
        tuple: (should_skip, reason) where should_skip is boolean and reason is explanation
    """
    current_year = date.today().year

    # Skip if no close date AND fiscal year is in the past
    if not close_date and fiscal_year and fiscal_year < current_year:
        return True, f"No close date and fiscal year {fiscal_year} is in the past"

    return False, None


def get_batch_prompt(grants_batch):
    """Generate the prompt for batch AI extraction based on multiple grant opportunities."""
    batch_json = json.dumps(grants_batch, indent=2)
    grant_count = len(grants_batch)

    prompt = f"""
IMPORTANT: You MUST return ONLY a valid JSON array. Do not include any explanatory text, comments, or additional information.

You are processing {grant_count} grants from grants.gov. For each grant, extract key information into a JSON object.

Input data:
{batch_json}

CRITICAL INSTRUCTIONS:
1. Return ONLY a JSON array starting with [ and ending with ]
2. No explanatory text before or after the JSON
3. No comments or additional information
4. Process each grant in the exact order provided

For each grant, create an object with these exact fields:
- index: The grant's position (0, 1, 2, etc.)
- description_summary: Brief summary of grant purpose (focus on school district relevance)
- eligibility_summary: Who can apply (explicitly state if public school districts, LEAs, or K-12 schools are eligible)
- extra: Additional relevant details as JSON object
- relevance_score: Integer 0-100 reflecting relevance to U.S. public school districts:
  * 90-100: Specifically targets K-12 schools, LEAs, or districts
  * 70-89: Education-related, commonly applicable to schools
  * 40-69: Schools technically eligible, broader focus
  * 0-39: Minimal relevance to districts

REQUIRED OUTPUT FORMAT (no other text):
[
  {{
    "index": 0,
    "description_summary": "Brief grant description",
    "eligibility_summary": "Who can apply",
    "extra": {{}},
    "relevance_score": 50
  }},
  {{
    "index": 1,
    "description_summary": "Brief grant description",
    "eligibility_summary": "Who can apply",
    "extra": {{"deadline_note": "Applications due by 5 PM"}},
    "relevance_score": 75
  }}
]
    """
    return prompt


def batch_process_grants_with_ai(grants_data):
    """Process multiple grants in a single AI API call for efficiency."""
    if not grants_data:
        return []

    try:
        print(f"Processing batch of {len(grants_data)} grants with AI")
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

        print(f"Successfully processed {len(processed_grants)} grants with AI")
        return processed_grants

    except json.JSONDecodeError as e:
        print(f"Error parsing AI response as JSON: {e}")
        print(f"AI response was: {ai_response[:500]}...")
        return []
    except Exception as e:
        print(f"Error in AI processing: {e}")
        return []


def process_grants_individually(grants_data):
    """Process grants individually when batch processing fails."""
    if not grants_data:
        return []

    print(f"Processing {len(grants_data)} grants individually as fallback...")
    results = []

    for i, grant_data in enumerate(grants_data):
        try:
            # Create individual prompt for single grant
            individual_prompt = f"""
                You are an AI agent specialized in processing grant data from grants.gov.
                Extract and organize key information from this single grant into a structured JSON object.
                
                Grant data:
                {json.dumps(grant_data, indent=2)}
                
                Instructions:
                - description_summary: Concise summary of grant purpose (focus on school district relevance)
                - eligibility_summary: Who can apply (explicitly state if public school districts, LEAs, or K-12 schools are eligible)
                - extra: Additional relevant details as JSON object
                - relevance_score: Integer 0-100 reflecting relevance to U.S. public school districts:
                  * 90-100: Specifically targets K-12 schools, LEAs, or districts
                  * 70-89: Education-related, commonly applicable to schools
                  * 40-69: Schools technically eligible, broader focus
                  * 0-39: Minimal relevance to districts
                
                Return ONLY a JSON object (not an array) with these keys:
                {{
                    "index": {i},
                    "description_summary": "...",
                    "eligibility_summary": "...",
                    "extra": {{}},
                    "relevance_score": 50
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
                    f"  Processed grant {i+1}/{len(grants_data)}: {grant_data.get('opportunity_number', 'Unknown')}"
                )
            else:
                print(
                    f"  Failed to process grant {i+1}: {grant_data.get('opportunity_number', 'Unknown')}"
                )

        except Exception as e:
            print(f"  Error processing individual grant {i+1}: {e}")
            continue

    print(
        f"Individual processing completed: {len(results)}/{len(grants_data)} grants processed"
    )
    return results


def prepare_forecasted_grant(op, session):
    """Prepare a forecasted grant for batch processing."""
    # Extract forecast details
    forecast = op.get("forecast", {}) or {}

    # Get opportunity number
    opp_number = op.get("opportunityNumber")

    # Try to parse lastUpdatedDate in multiple formats
    last_updated_str = forecast.get("lastUpdatedDate")
    last_updated = helpers.parse_date(last_updated_str) if last_updated_str else None

    # Check if opportunity already exists
    opportunity = (
        session.query(Opportunity)
        .filter_by(source_grant_id=opp_number, source="grants.gov")
        .first()
    )

    # Initialize opportunity if it doesn't exist
    if not opportunity:
        opportunity = Opportunity(
            source_grant_id=opp_number,
            source="grants.gov",
            state_code="US",
            status="forecasted",
            title=op.get("opportunityTitle"),
        )
        session.add(opportunity)

    # Set funding type for all grants.gov opportunities as federal
    opportunity.funding_type = FundingTypeEnum.federal

    # if opportunity not updated, skip
    if opportunity.last_updated and opportunity.last_updated.date() == last_updated:
        print(f"Skipping {opportunity.source_grant_id}, no update.")
        return None

    # Extract category
    opportunity.category = op.get("opportunityCategory", {}).get("description")

    # Build the grants.gov detail URL using the opportunity ID
    opp_id = op.get("id")
    if opp_id:
        opportunity.url = f"https://www.grants.gov/search-results-detail/{opp_id}"
    else:
        opportunity.url = None

    # Extract agency name
    agencyDetails = op.get("agencyDetails", {}) or {}
    opportunity.agency = agencyDetails.get("agencyName")

    # Extract funding instrument (take first if multiple)
    funding_instruments = forecast.get("fundingInstruments", [])
    if funding_instruments:
        opportunity.funding_instrument = funding_instruments[0].get("description")

    # Forecast-level fields
    opportunity.description = forecast.get("forecastDesc")
    opportunity.fiscal_year = forecast.get("fiscalYear")
    opportunity.close_date = helpers.parse_date(
        forecast.get("estApplicationResponseDateStr")
    )
    opportunity.eligibility = forecast.get("applicantEligibilityDesc")
    opportunity.contact_name = forecast.get("agencyContactName")
    opportunity.contact_email = forecast.get("agencyContactEmail")
    opportunity.contact_phone = forecast.get("agencyContactPhone")
    opportunity.post_date = helpers.parse_date(
        forecast.get("estSynopsisPostingDateStr")
    )
    opportunity.last_updated = last_updated
    opportunity.cost_sharing = forecast.get("costSharing")
    fundingLinkUrl = forecast.get("fundingDescLinkUrl")
    fundingLinkDesc = forecast.get("fundingDescLinkDesc")
    opportunity.attachments = []
    if fundingLinkUrl and fundingLinkDesc:
        opportunity.attachments.append({"name": fundingLinkDesc, "url": fundingLinkUrl})

    opportunity.award_ceiling = (
        int(forecast["awardCeiling"]) if forecast.get("awardCeiling") else None
    )
    opportunity.award_floor = (
        int(forecast["awardFloor"]) if forecast.get("awardFloor") else None
    )
    opportunity.total_funding_amount = (
        int(forecast["estimatedFunding"]) if forecast.get("estimatedFunding") else None
    )

    # Check if this grant should be skipped based on close_date and fiscal_year
    should_skip, skip_reason = should_skip_grant(
        opportunity.close_date, opportunity.fiscal_year
    )
    if should_skip:
        print(f"Skipping {opportunity.source_grant_id}: {skip_reason}")
        # Remove from session if we just added it
        if opportunity in session.new:
            session.expunge(opportunity)
        return None

    current_opportunity = {
        "index": 0,  # Will be set during batch processing
        "opportunity_number": opportunity.source_grant_id,
        "title": opportunity.title,
        "funding_instrument": opportunity.funding_instrument,
        "funding_category": opportunity.category,
        "description": opportunity.description[:2000]
        if opportunity.description
        else None,  # Limit for batch processing
        "agency": opportunity.agency,
        "award_ceiling": opportunity.award_ceiling,
        "award_floor": opportunity.award_floor,
        "total_funding_amount": opportunity.total_funding_amount,
        "post_date": str(opportunity.post_date),
        "close_date": str(opportunity.close_date),
        "archive_date": str(opportunity.archive_date),
        "fiscal_year": opportunity.fiscal_year,
        "contact_name": opportunity.contact_name,
        "contact_email": opportunity.contact_email,
        "contact_phone": opportunity.contact_phone,
        "cost_sharing": opportunity.cost_sharing,
        "attachments": opportunity.attachments,
        "eligibility": opportunity.eligibility[:1000]
        if opportunity.eligibility
        else None,  # Limit for batch processing
    }

    return {
        "opportunity": opportunity,
        "grant_data": current_opportunity,
        "raw_data": op,
    }


def prepare_posted_grant(op, opp_status, session):
    """Prepare a posted grant for batch processing."""
    # Extract synopsis details
    synopsis = op.get("synopsis", {}) or {}

    # Get opportunity number
    opp_number = op.get("opportunityNumber")

    # Try to parse lastUpdatedDate
    last_updated_str = synopsis.get("lastUpdatedDate")
    last_updated = helpers.parse_date(last_updated_str) if last_updated_str else None

    # Check if opportunity already exists
    opportunity = (
        session.query(Opportunity)
        .filter_by(source_grant_id=opp_number, source="grants.gov")
        .first()
    )

    # Initialize opportunity if it doesn't exist
    if not opportunity:
        opportunity = Opportunity(
            source_grant_id=opp_number,
            source="grants.gov",
            state_code="US",
            title=op.get("opportunityTitle"),
            status=opp_status,
        )
        session.add(opportunity)

    # Set funding type for all grants.gov opportunities as federal
    opportunity.funding_type = FundingTypeEnum.federal

    # if opportunity not updated, skip
    if opportunity.last_updated and opportunity.last_updated.date() == last_updated:
        print(f"Skipping {opportunity.source_grant_id}, no update.")
        return None

    # Agency details
    agency_details = op.get("agencyDetails", {}) or {}
    opportunity.agency = agency_details.get("agencyName") if agency_details else None

    # Extract category
    opportunity.category = op.get("opportunityCategory", {}).get("description")

    # Build the grants.gov detail URL using the opportunity ID
    opp_id = op.get("id")
    if opp_id:
        opportunity.url = f"https://www.grants.gov/search-results-detail/{opp_id}"
    else:
        opportunity.url = None

    opportunity.status = opp_status

    # synopsis-level fields
    opportunity.description = synopsis.get("synopsisDesc")
    opportunity.fiscal_year = synopsis.get("fiscalYear")
    opportunity.post_date = helpers.parse_date(synopsis.get("postingDateStr"))
    opportunity.close_date = helpers.parse_date(synopsis.get("responseDateStr"))
    opportunity.archive_date = helpers.parse_date(synopsis.get("archiveDateStr"))
    opportunity.cost_sharing = synopsis.get("costSharing")
    opportunity.eligibility = synopsis.get("applicantEligibilityDesc")
    opportunity.contact_name = synopsis.get("agencyContactName")
    opportunity.contact_email = synopsis.get("agencyContactEmail")
    opportunity.contact_phone = synopsis.get("agencyContactPhone")
    opportunity.last_updated = last_updated
    fundingLinkUrl = synopsis.get("fundingDescLinkUrl")
    fundingLinkDesc = synopsis.get("fundingDescLinkDesc")
    opportunity.attachments = []
    if fundingLinkUrl and fundingLinkDesc:
        opportunity.attachments.append({"name": fundingLinkDesc, "url": fundingLinkUrl})

    # Extract funding instrument (take first if multiple)
    funding_instruments = synopsis.get("fundingInstruments", [])
    if funding_instruments:
        opportunity.funding_instrument = funding_instruments[0].get("description")

    # Extract award ceiling
    award_ceiling_val = synopsis.get("awardCeiling")
    if award_ceiling_val and str(award_ceiling_val).lower() != "none":
        try:
            opportunity.award_ceiling = int(award_ceiling_val)
        except (ValueError, TypeError):
            opportunity.award_ceiling = None
    else:
        opportunity.award_ceiling = None

    # Extract award floor
    award_floor_val = synopsis.get("awardFloor")
    if award_floor_val and str(award_floor_val).lower() != "none":
        try:
            opportunity.award_floor = int(award_floor_val)
        except (ValueError, TypeError):
            opportunity.award_floor = None
    else:
        opportunity.award_floor = None

    # Extract total funding amount
    total_funding_amount_val = synopsis.get("estimatedFunding")
    if total_funding_amount_val and str(total_funding_amount_val).lower() != "none":
        try:
            opportunity.total_funding_amount = int(total_funding_amount_val)
        except (ValueError, TypeError):
            opportunity.total_funding_amount = None
    else:
        opportunity.total_funding_amount = None

    # Check if this grant should be skipped based on close_date and fiscal_year
    should_skip, skip_reason = should_skip_grant(
        opportunity.close_date, opportunity.fiscal_year
    )
    if should_skip:
        print(f"Skipping {opportunity.source_grant_id}: {skip_reason}")
        # Remove from session if we just added it
        if opportunity in session.new:
            session.expunge(opportunity)
        return None

    current_opportunity = {
        "index": 0,  # Will be set during batch processing
        "opportunity_number": opportunity.source_grant_id,
        "title": opportunity.title,
        "funding_instrument": opportunity.funding_instrument,
        "funding_category": opportunity.category,
        "description": opportunity.description[:2000]
        if opportunity.description
        else None,  # Limit for batch processing
        "agency": opportunity.agency,
        "award_ceiling": opportunity.award_ceiling,
        "award_floor": opportunity.award_floor,
        "total_funding_amount": opportunity.total_funding_amount,
        "post_date": str(opportunity.post_date),
        "close_date": str(opportunity.close_date),
        "archive_date": str(opportunity.archive_date),
        "fiscal_year": opportunity.fiscal_year,
        "contact_name": opportunity.contact_name,
        "contact_email": opportunity.contact_email,
        "contact_phone": opportunity.contact_phone,
        "cost_sharing": opportunity.cost_sharing,
        "attachments": opportunity.attachments,
        "eligibility": opportunity.eligibility[:1000]
        if opportunity.eligibility
        else None,  # Limit for batch processing
    }

    return {
        "opportunity": opportunity,
        "grant_data": current_opportunity,
        "raw_data": op,
    }


def apply_ai_results_to_opportunity(opportunity, ai_data):
    """Apply AI processing results to an opportunity object."""
    try:
        if "description_summary" in ai_data:
            opportunity.description_summary = ai_data["description_summary"]
        if "eligibility_summary" in ai_data:
            opportunity.eligibility_summary = ai_data["eligibility_summary"]
        if "extra" in ai_data:
            opportunity.extra = ai_data["extra"]
        if "relevance_score" in ai_data:
            try:
                relevance_score = int(ai_data["relevance_score"])
                if 0 <= relevance_score <= 100:
                    opportunity.relevance_score = relevance_score
                else:
                    print(
                        f"Relevance score {relevance_score} out of bounds (0-100). Setting to None."
                    )
                    opportunity.relevance_score = None
            except (ValueError, TypeError):
                print(
                    f"Invalid relevance score value: {ai_data['relevance_score']}. Setting to None."
                )
                opportunity.relevance_score = None

        # Generate and populate raw_text using the helper function
        opportunity.raw_text = helpers.format_opportunity_text(opportunity)

        return True
    except Exception as e:
        print(f"Error applying AI results: {e}")
        return False


def process_batch(batch, session):
    """Process a batch of grants with AI and update the database."""
    if not batch:
        return 0

    print(f"Processing batch of {len(batch)} grants...")

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
        processed_grants = process_grants_individually(batch_data)

    if not processed_grants:
        print("Both batch and individual processing failed for this batch")
        return 0

    # Apply AI results to opportunities and commit
    updated_count = 0
    for j, ai_result in enumerate(processed_grants):
        if j < len(batch):
            grant_info = batch[j]
            opportunity = grant_info["opportunity"]

            if apply_ai_results_to_opportunity(opportunity, ai_result):
                session.commit()
                print(f"Upserted {opportunity.source_grant_id}: {opportunity.title}")
                updated_count += 1
            else:
                session.rollback()

    return updated_count


def update_expired(session):
    """Mark expired opportunities as closed."""

    today = date.today()

    # Query for opportunities that have passed their archive date
    archived = (
        session.query(Opportunity)
        .filter(Opportunity.archive_date is not None)
        .filter(Opportunity.archive_date < today)
        .filter(
            Opportunity.status.in_(
                [
                    OpportunityStatusEnum.posted,
                    OpportunityStatusEnum.forecasted,
                    OpportunityStatusEnum.closed,
                ]
            )
        )
        .filter(Opportunity.source == "grants.gov")
        .all()
    )

    for opp in archived:
        opp.status = OpportunityStatusEnum.archived
        print(f"Marked {opp.source_grant_id} as archived (archive date passed).")

    expired = (
        session.query(Opportunity)
        .filter(Opportunity.close_date is not None)
        .filter(Opportunity.close_date < today)
        .filter(
            Opportunity.status.in_(
                [OpportunityStatusEnum.posted, OpportunityStatusEnum.forecasted]
            )
        )
        .filter(Opportunity.source == "grants.gov")
        .all()
    )
    # Mark expired opportunities as closed
    for opp in expired:
        opp.status = OpportunityStatusEnum.closed
        print(f"Marked {opp.source_grant_id} as closed (expired).")

    session.commit()


def main():
    with flask_app.app_context():
        session = db.session

        # Fetch Department of Education opportunities from grants.gov
        response = requests.post(
            SEARCH_URL,
            json={
                "agencies": "ED|ED-*",
                "oppStatuses": "forecasted|posted",
                "dateRange": "",
                "rows": 5000,
            },
        )
        response.raise_for_status()

        opps = response.json().get("data", {}).get("oppHits", [])
        print(f"Found {len(opps)} Department of Education opportunities.")

        # Fetch opportunities from grants.gov search API
        response = requests.post(
            SEARCH_URL,
            json={
                "oppStatuses": "forecasted|posted",
                "eligibilities": "05",
                "dateRange": "",
                "rows": 5000,
            },
            headers=HEADERS,
        )
        response.raise_for_status()

        # Extract opportunity summaries
        rest_opps = response.json().get("data", {}).get("oppHits", [])
        print(f"Found {len(rest_opps)} opportunities.")
        opps.extend(rest_opps)

        # Process grants in batches of 5 as soon as they're ready
        batch_size = 5
        current_batch = []
        updated_count = 0

        for opp_summary in opps:
            opp_id = opp_summary["id"]
            opp_status = opp_summary["oppStatus"]

            # Fetch full opportunity details via grants.gov fetchOpportunity API
            detail_resp = requests.post(
                FETCH_URL, json={"opportunityId": opp_id}, headers=HEADERS
            )
            detail_resp.raise_for_status()
            detail = detail_resp.json().get("data", {})

            # Prepare the opportunity for batch processing
            if opp_status == "forecasted":
                prepared_grant = prepare_forecasted_grant(detail, session)
            else:
                prepared_grant = prepare_posted_grant(detail, opp_status, session)

            if prepared_grant:  # Only add if not skipped
                current_batch.append(prepared_grant)

                # Process batch when it reaches the batch size
                if len(current_batch) >= batch_size:
                    updated_count += process_batch(current_batch, session)
                    current_batch = []  # Reset batch

        # Process any remaining grants in the final batch
        if current_batch:
            updated_count += process_batch(current_batch, session)

        print(f"Successfully processed {updated_count} grants with AI")
        update_expired(session)


if __name__ == "__main__":
    main()
