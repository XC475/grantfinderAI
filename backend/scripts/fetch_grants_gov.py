import requests
from datetime import datetime, date
import sys
import os

# Add the parent directory to the path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import db_manager
from models_sql.opportunity import Opportunity, OpportunityStatusEnum
from models_sql.agency import Agency
from models_sql.cfda_program import CFDAProgram
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Setup ---
HEADERS = {"Content-Type": "application/json"}
SEARCH_URL = "https://api.grants.gov/v1/api/search2"
FETCH_URL = "https://api.grants.gov/v1/api/fetchOpportunity"


def parse_date(date_str):
    """Parse date string in multiple formats to datetime object"""

    if not date_str:
        return None
    try:
        # Try ISO with T
        return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S").replace(microsecond=0)
    except ValueError:
        try:
            # Try "YYYY-MM-DD-HH-MM-SS" (e.g., "2026-09-01-00-00-00")
            return datetime.strptime(date_str, "%Y-%m-%d-%H-%M-%S")
        except ValueError:
            try:
                # Fallback to date only
                return datetime.strptime(date_str[:10], "%Y-%m-%d")
            except Exception:
                return None


def upsert_forecasted_grant(op, session):
    """Upsert a forecasted grant opportunity into the database"""

    forecast = op.get("forecast", {}) or {}

    # --- Opportunity ---
    opp_number = op.get("opportunityNumber")

    # Try to parse lastUpdatedDate in multiple formats
    last_updated_str = forecast.get("lastUpdatedDate")
    last_updated = None
    if last_updated_str:
        try:
            # Try ISO format first
            last_updated = parse_date(last_updated_str)
        except Exception:
            pass
        if not last_updated:
            try:
                # Try "Aug 28, 2025 03:13:35 PM EDT" format
                last_updated = datetime.strptime(last_updated_str, "%b %d, %Y %I:%M:%S %p %Z")
            except Exception:
                last_updated = None

    opportunity = session.query(Opportunity).filter_by(opportunity_number=opp_number, source="grants.gov").first()

    if opportunity and opportunity.last_updated == last_updated:
        # Nothing changed, skip
        print(f"Skipping {opp_number}, no update.")
        return

    if not opportunity:
        opportunity = Opportunity(opportunity_number=opp_number, source="grants.gov", state_code="US", status="forecasted", title= op.get("opportunityTitle"))
        session.add(opportunity)
    
    # --- Agency ---
    agency_code = op.get("owningAgencyCode")
    agency_name = (
        op.get("agencyDetails", {}).get("agencyName")
        or forecast.get("agencyDetails", {}).get("agencyName")
    )
    agency = None
    if agency_code:
        agency = session.query(Agency).filter_by(code=agency_code, source="grants.gov").first()
        if not agency:
            agency = Agency(code=agency_code, name=agency_name, source="grants.gov")
            session.add(agency)

    # Root fields
    opportunity.category = op.get("opportunityCategory", {}).get("description")

    # Build the grants.gov detail URL using the opportunity ID
    opp_id = op.get("id")
    if opp_id:
        opportunity.url = f"https://www.grants.gov/search-results-detail/{opp_id}"
    else:
        opportunity.url = None
    opportunity.status = "forecasted"

    # Forecast-level fields
    opportunity.description = forecast.get("forecastDesc")
    opportunity.fiscal_year = forecast.get("fiscalYear")
    opportunity.post_date = parse_date(forecast.get("postingDateStr"))
    opportunity.close_date = parse_date(forecast.get("estApplicationResponseDateStr"))
    opportunity.award_date = parse_date(forecast.get("estAwardDateStr"))
    opportunity.award_ceiling = int(forecast["awardCeiling"]) if forecast.get("awardCeiling") else None
    opportunity.award_floor = int(forecast["awardFloor"]) if forecast.get("awardFloor") else None
    opportunity.number_of_awards = int(forecast["numberOfAwards"]) if forecast.get("numberOfAwards") else None
    opportunity.eligibility = forecast.get("applicantEligibilityDesc")
    opportunity.last_updated = last_updated
    opportunity.contact_name = forecast.get("agencyContactName")
    opportunity.contact_email = forecast.get("agencyContactEmail")
    opportunity.contact_phone = forecast.get("agencyContactPhone")
    opportunity.version = int(forecast["version"]) if forecast.get("version") else None
    opportunity.total_funding_amount = int(forecast["estimatedFunding"]) if forecast.get("estimatedFunding") else None
    opportunity.est_post_date = parse_date(forecast.get("estSynopsisPostingDateStr"))

    if agency:
        opportunity.agencies = [agency]

    # --- CFDA Programs ---
    cfda_objs = []
    for cfda in op.get("cfdas", []):
        cfda_num = cfda.get("cfdaNumber")
        if not cfda_num:
            continue
        cfda_obj = session.query(CFDAProgram).filter_by(number=cfda_num).first()
        if not cfda_obj:
            cfda_obj = CFDAProgram(number=cfda_num, title=cfda.get("programTitle", ""))
            session.add(cfda_obj)
        cfda_objs.append(cfda_obj)
    opportunity.cfda_programs = cfda_objs

    session.flush()  # Flush to get the ID, but don't commit yet
    logger.info(f"Upserted forecasted grant {opportunity.opportunity_number}: {opportunity.title}")

def upsert_grant(op, opp_status, session):
    """Upsert a posted grant opportunity into the database"""

    synopsis = op.get("synopsis", {}) or {}

     # Try to parse lastUpdatedDate in multiple formats
    last_updated_str = synopsis.get("lastUpdatedDate")
    last_updated = None
    if last_updated_str:
        try:
            # Try ISO format first
            last_updated = parse_date(last_updated_str)
        except Exception:
            pass
        if not last_updated:
            try:
                # Try "Aug 28, 2025 03:13:35 PM EDT" format
                last_updated = datetime.strptime(last_updated_str, "%b %d, %Y %I:%M:%S %p %Z")
            except Exception:
                last_updated = None

    opp_number = op.get("opportunityNumber")
    opportunity = session.query(Opportunity).filter_by(opportunity_number=opp_number, source="grants.gov").first()

    if opportunity and opportunity.last_updated == last_updated:
        # Nothing changed, skip
        print(f"Skipping {opp_number}, no update.")
        return

    if not opportunity:
        opportunity = Opportunity(opportunity_number=opp_number, source="grants.gov", state_code="US", title=op.get("opportunityTitle"), status=opp_status)
        session.add(opportunity)

    # --- Agency ---
    agency_details = op.get("agencyDetails", {}) or {}
    agency_code = agency_details.get("agencyCode") or op.get("owningAgencyCode")
    agency_name = agency_details.get("agencyName")
    agency = None
    if agency_code:
        agency = session.query(Agency).filter_by(code=agency_code).first()
        if not agency:
            agency = Agency(code=agency_code, name=agency_name)
            session.add(agency)

    # Root fields
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
    opportunity.post_date = parse_date(synopsis.get("postingDateStr"))
    opportunity.close_date = parse_date(synopsis.get("applicationCloseDateStr")) or parse_date(synopsis.get("responseDateStr"))
    opportunity.award_date = parse_date(synopsis.get("awardDateStr"))
    award_ceiling_val = synopsis.get("awardCeiling")
    if award_ceiling_val and str(award_ceiling_val).lower() != "none":
        try:
            opportunity.award_ceiling = int(award_ceiling_val)
        except (ValueError, TypeError):
            opportunity.award_ceiling = None
    else:
        opportunity.award_ceiling = None
    award_floor_val = synopsis.get("awardFloor")
    if award_floor_val and str(award_floor_val).lower() != "none":
        try:
            opportunity.award_floor = int(award_floor_val)
        except (ValueError, TypeError):
            opportunity.award_floor = None
    else:
        opportunity.award_floor = None
    opportunity.number_of_awards = int(synopsis["numberOfAwards"]) if synopsis.get("numberOfAwards") else None
    opportunity.eligibility = synopsis.get("applicantEligibilityDesc")
    opportunity.last_updated = last_updated
    opportunity.contact_name = synopsis.get("agencyContactName")
    opportunity.contact_email = synopsis.get("agencyContactEmail")
    opportunity.contact_phone = synopsis.get("agencyContactPhone")
    opportunity.version = int(synopsis["version"]) if synopsis.get("version") else None
    opportunity.total_funding_amount = int(synopsis["estimatedFunding"]) if synopsis.get("estimatedFunding") else None

    if agency:
        opportunity.agencies = [agency]

    # --- CFDA Programs ---
    cfda_objs = []
    for cfda in op.get("cfdas", []):
        cfda_num = cfda.get("cfdaNumber")
        if not cfda_num:
            continue
        cfda_obj = session.query(CFDAProgram).filter_by(number=cfda_num).first()
        if not cfda_obj:
            cfda_obj = CFDAProgram(number=cfda_num, title=cfda.get("programTitle", ""))
            session.add(cfda_obj)
        cfda_objs.append(cfda_obj)
    opportunity.cfda_programs = cfda_objs

    session.flush()  # Flush to get the ID, but don't commit yet
    logger.info(f"Upserted grant {opportunity.opportunity_number}: {opportunity.title}")



def update_expired(session):
    """Mark expired opportunities as closed."""

    today = date.today()
    expired = (
        session.query(Opportunity)
        .filter(Opportunity.close_date != None)
        .filter(Opportunity.close_date < today)
        .filter(Opportunity.status.in_([OpportunityStatusEnum.posted, OpportunityStatusEnum.forecasted]))
        .filter(Opportunity.source == "grants.gov")
        .all()
    )
    for opp in expired:
        opp.status = OpportunityStatusEnum.closed
        logger.info(f"Marked {opp.opportunity_number} as closed (expired).")
    session.flush()  # Flush changes, commit happens in context manager


def main():
    """Main function to fetch grants from grants.gov"""

    logger.info("Starting grants.gov fetch process...")
    
    # Test database connection
    if not db_manager.test_connection():
        logger.error("Database connection failed. Exiting.")
        return
    
    try:
        with db_manager.get_session() as session:
            # Search for opportunities
            response = requests.post(
                SEARCH_URL,
                json={"oppStatuses": "forecasted|posted", "eligibilities": "05", "dateRange": "", "rows": 5000},
                headers=HEADERS,
            )
            response.raise_for_status()
            opps = response.json().get("data", {}).get("oppHits", [])
            logger.info(f"Found {len(opps)} opportunities.")

            # Process each opportunity
            for opp_summary in opps:
                try:
                    opp_id = opp_summary["id"]
                    opp_status = opp_summary["oppStatus"]
                    
                    # Fetch detailed opportunity data
                    detail_resp = requests.post(FETCH_URL, json={"opportunityId": opp_id}, headers=HEADERS)
                    detail_resp.raise_for_status()
                    detail = detail_resp.json().get("data", {})

                    if opp_status == "forecasted":
                        upsert_forecasted_grant(detail, session)
                    else:
                        upsert_grant(detail, opp_status, session)
                        
                except Exception as e:
                    logger.error(f"Error processing opportunity {opp_summary.get('id', 'unknown')}: {e}")
                    continue

            # Update expired opportunities
            update_expired(session)
            
        logger.info("Grants.gov fetch process completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main process: {e}")
        raise


if __name__ == "__main__":
    main()
