"""backend/scripts/fetch_grants_gov.py
Fetch and process grant opportunities from grants.gov API.
"""

import requests
from datetime import datetime, date
import os
import sys
import helpers

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, OpportunityStatusEnum
import json

# App + API setup
flask_app = server.create_app()
HEADERS = {"Content-Type": "application/json"}
SEARCH_URL = "https://api.grants.gov/v1/api/search2"
FETCH_URL = "https://api.grants.gov/v1/api/fetchOpportunity"
model = "google/gemini-2.5-flash-preview-09-2025:online"


def get_prompt(op_response, current_opportunity):
    """Generate the prompt for AI extraction based on the opportunity data."""
    prompt = f"""
        You are an AI agent specialized in processing grant data from grants.gov. You will be given a partially populated grant object along with the full grant details. Your task is to extract, summarize, and organize key information into a structured JSON object.
        The goal is to build a searchable grants database specifically for U.S. public school districts, so focus on identifying and clearly stating information most relevant to school administrators and district grant officers.
        
        The data to process is as follows:
        {op_response}

        The current partially loaded context is:
        {current_opportunity}

        Instructions:
        description_summary: 
        Write a concise, plain-language summary of the grant's purpose and what it funds.
        Highlight aspects relevant to public school districts (e.g., education, student programs, technology, infrastructure).

        eligibility_summary: 
        Summarize the eligibility rules in plain English. Explicitly state if public school districts, local education agencies (LEAs), or K-12 schools are eligible.
        If eligibility is broad, note that but clarify whether districts are included. Do not include Yes/No answers, just a summary.

        extra: 
        Include any other important details that might help a school district decide if the grant is worth pursuing or to understand its context.
        Use a structured JSON object with key-value pairs.
        Do not repeat information already covered in other fields.

        relevance_score:
        Assign an integer (0-100) that reflects how directly the grant applies to U.S. public school districts, based on the following rubric:
        - 90-100 → Specifically targets K-12 schools, LEAs, or districts.
        - 70-89 → Education-related and commonly applicable to schools, but not exclusive (e.g., broadband, health/nutrition mentioning schools).
        - 40-69 → Schools technically eligible, but grant focus is broader (e.g., community programs where districts are one of many eligible entities).
        - 0-39 → Minimal relevance to districts, even if technically eligible.

        Output Format:
        Return only valid JSON with the following keys:
        - description_summary
        - eligibility_summary
        - extra
        - relevance_score

        Do not include any explanation or text outside the JSON object.
    """

    return prompt


def upsert_forecasted_grant(op, session):
    """Upsert a forecasted grant opportunity from grants.gov data."""

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

    # if opportunity not updated, skip
    if opportunity.last_updated and opportunity.last_updated.date() == last_updated:
        print(f"Skipping {opportunity.source_grant_id}, no update.")
        return

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

    current_opportunity = {
        "opportunity_number": opportunity.source_grant_id,
        "title": opportunity.title,
        "funding_instrument": opportunity.funding_instrument,
        "funding_category": opportunity.category,
        "description": opportunity.description,
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
        "eligibility": opportunity.eligibility,
    }

    # Call AI extraction function
    ai_extract_data_result = helpers.ai_extract_data(
        get_prompt(op, current_opportunity), model
    )

    # strip ```json ... ``` if present in AI response
    if ai_extract_data_result and ai_extract_data_result.startswith("```json"):
        ai_extract_data_result = (
            ai_extract_data_result.replace("```json", "").replace("```", "").strip()
        )

    # Validate essential fields from ai response
    if ai_extract_data_result:
        try:
            ai_data = json.loads(ai_extract_data_result)
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
        except json.JSONDecodeError as e:
            print(f"Error parsing AI extracted data: {e}")

    session.commit()
    print(f"Upserted {opportunity.source_grant_id}: {opportunity.title}")


def upsert_grant(op, opp_status, session):
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

    # if opportunity not updated, skip
    if opportunity.last_updated and opportunity.last_updated.date() == last_updated:
        print(f"Skipping {opportunity.source_grant_id}, no update.")
        return

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

    current_opportunity = {
        "opportunity_number": opportunity.source_grant_id,
        "title": opportunity.title,
        "funding_instrument": opportunity.funding_instrument,
        "funding_category": opportunity.category,
        "description": opportunity.description,
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
        "eligibility": opportunity.eligibility,
    }

    # Call AI extraction function
    ai_extract_data_result = helpers.ai_extract_data(
        get_prompt(op, current_opportunity), model
    )

    # strip ```json ... ``` if present in AI response
    if ai_extract_data_result and ai_extract_data_result.startswith("```json"):
        ai_extract_data_result = (
            ai_extract_data_result.replace("```json", "").replace("```", "").strip()
        )

    # Validate essential fields from ai response
    if ai_extract_data_result:
        try:
            ai_data = json.loads(ai_extract_data_result)
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
        except json.JSONDecodeError as e:
            print(f"Error parsing AI extracted data: {e}")

    session.commit()
    print(f"Upserted {opportunity.source_grant_id}: {opportunity.title}")


def update_expired(session):
    """Mark expired opportunities as closed."""

    # TODO: ADD ARCHIVE DATE CHECK, AND UPDATE GRANT STATUS

    today = date.today()

    # Query for opportunities that have passed their close date and are still open
    archived = (
        session.query(Opportunity)
        .filter(Opportunity.archive_date != None)
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
        .filter(Opportunity.close_date != None)
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
        opps = response.json().get("data", {}).get("oppHits", [])
        print(f"Found {len(opps)} opportunities.")

        for opp_summary in opps:
            opp_id = opp_summary["id"]
            opp_status = opp_summary["oppStatus"]

            # Fetch full opportunity details via grants.gov fetchOpportunity API
            detail_resp = requests.post(
                FETCH_URL, json={"opportunityId": opp_id}, headers=HEADERS
            )
            detail_resp.raise_for_status()
            detail = detail_resp.json().get("data", {})

            # Upsert the opportunity into the database
            if opp_status == "forecasted":
                upsert_forecasted_grant(detail, session)
            else:
                upsert_grant(detail, opp_status, session)

        update_expired(session)


if __name__ == "__main__":
    main()
