"""backend/scripts/fetch_grants_nysed.py
Script to fetch and process grants from the New York State Education Department website."""

import os
import sys
from datetime import date
import json
import hashlib
import logging
from typing import List, Dict, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
import helpers

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
from models_sql import Opportunity, OpportunityStatusEnum

# Flask app context setup
flask_app = server.create_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# NYSED configuration
BASE_URL = "https://www.nysed.gov"
GRANTS_LISTING_URL = "https://www.nysed.gov/funding-opportunities/grants"
model = "google/gemini-2.5-flash-preview-09-2025:online"


def calculate_content_hash(content: str) -> str:
    """Calculate MD5 hash of content for change detection."""
    return hashlib.md5(content.encode("utf-8")).hexdigest()


def extract_grant_urls(base_url: str) -> List[str]:
    """Extract all grant URLs from the main grants listing page, specifically within divs with class 'field__item'."""
    print(f"Fetching grant URLs from {base_url}")

    try:
        response = requests.get(base_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        grant_urls = []
        # Find all divs with class 'field__item'
        for div in soup.find_all("div", class_="field__item"):
            for link in div.find_all("a", href=True):
                href = link["href"]
                full_url = urljoin(BASE_URL, href) if href.startswith("/") else href
                if full_url not in grant_urls:
                    grant_urls.append(full_url)

        print(f"Found {len(grant_urls)} potential grant URLs")
        return grant_urls

    except Exception as e:
        print(f"Error extracting grant URLs: {e}")
        return []


def extract_grant_data(url: str) -> Optional[Dict]:
    """Extract raw grant data from a single grant page."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract basic information
        title_element = soup.find("h1") or soup.find("title")
        title = title_element.get_text(strip=True) if title_element else None

        # Skip if this doesn't look like a grant page
        if not title or "grant" not in title.lower():
            return None

        # Extract all text content for AI processing
        main_content = soup.find("main") or soup.find("body")
        if not main_content:
            return None

        # Remove navigation, footer, and other non-content elements
        for element in main_content.find_all(["nav", "footer", "header", "aside"]):
            element.decompose()

        content_text = main_content.get_text(separator="\n", strip=True)

        content_hash = calculate_content_hash(content_text)

        # Check if content hash is the same as stored hash in db to skip unchanged grants
        existing_grant = (
            db.session.query(Opportunity).filter_by(url=url, source="nysed.gov").first()
        )
        existing_grant_extra = None
        if existing_grant and existing_grant.extra:
            if isinstance(existing_grant.extra, str):
                existing_grant_extra = json.loads(existing_grant.extra)
            else:
                existing_grant_extra = existing_grant.extra
        if (
            existing_grant_extra
            and existing_grant_extra.get("content_hash") == content_hash
        ):
            logger.info(f"Skipping: No changes detected for grant at {url}")
            return None

        # Extract any PDF/document links
        attachments = []
        for link in soup.find_all("a", href=True):
            href = link["href"]
            link_text = link.get_text(strip=True)
            if any(ext in href.lower() for ext in [".pdf", ".doc", ".docx"]):
                full_url = urljoin(BASE_URL, href) if href.startswith("/") else href
                attachments.append({"name": link_text, "url": full_url})

        return {
            "url": url,
            "title": title,
            "content": content_text,
            "attachments": attachments,
            "content_hash": content_hash,
        }

    except Exception as e:
        logger.error(f"Error extracting data from {url}: {e}")
        return None


def batch_process_grants_with_ai(grants_data: List[Dict]) -> List[Dict]:
    """Process multiple grants in a single AI API call for efficiency."""
    if not grants_data:
        return []

    # Prepare batch prompt
    batch_input = []
    for i, grant_data in enumerate(grants_data):
        batch_input.append(
            {
                "index": i,
                "url": grant_data["url"],
                "title": grant_data["title"],
                "content": grant_data["content"][:8000],  # Limit content length
                "attachments": grant_data["attachments"],
            }
        )

    batch_json = json.dumps(batch_input, indent=2)
    grant_count = len(batch_input)

    prompt = f"""
    You are an AI agent specialized in processing grant data from the New York State Education Department. 
    You will process multiple grants in a batch. For each grant, extract and organize key information into a structured JSON object.
    
    The goal is to build a searchable grants database specifically for U.S. public school districts, so focus on identifying 
    and clearly stating information most relevant to school administrators and district grant officers.
    
    Process the following {grant_count} grants:
    {batch_json}
    
    For EACH grant, extract the following information:
    
    Instructions for each grant:
    - title: Clean, properly formatted grant title
    - description: Full description text from the content.
    - eligibility: Extract full eligibility text from the content.
    - description_summary: Concise, plain-language summary of the grant's purpose and what it funds.
    - eligibility_summary: Summarize eligibility rules in plain English.
    - cost_sharing: Boolean indicating if cost sharing is required (true/false)
    - award_min: Minimum award amount as integer (extract from content, null if not found)
    - award_max: Maximum award amount as integer (extract from content, null if not found)  
    - total_funding_amount: Total program funding as integer (extract from content, null if not found)
    - post_date: Grant posting date in YYYY-MM-DD format (extract from content, null if not found)
    - close_date: Application deadline in YYYY-MM-DD format (extract from content, null if not found)
    - contact_name: Contact person name (extract from content, null if not found)
    - contact_email: Contact email (extract from content, null if not found)
    - contact_phone: Contact phone (extract from content, null if not found)
    - fiscal_year: Fiscal year as integer (extract from content, null if not found)
    - agency: Awarding agency name (usually "New York State Education Department" or specific office)
    - category: Grant category/type (e.g., "Education", "Title I", etc.)
    - extra: Any other important details as JSON object, extract as if they might be useful for directly printing in a grant listing with the key as a heading and the value as the corresponding text.
    
    Return ONLY a JSON array with one object per grant, in the same order as input. Use this exact format:
    [
      {{
        "title": "...",
        "description": "...",
        "eligibility": "...",
        "description_summary": "...",
        "eligibility_summary": "...", 
        "cost_sharing": false,
        "award_min": null,
        "award_max": null,
        "total_funding_amount": null,
        "post_date": null,
        "close_date": null,
        "contact_name": null,
        "contact_email": null,
        "contact_phone": null,
        "agency": "...",
        "category": "...",
        "extra": {{}}
      }}
    ]
    """

    try:
        logger.info(f"Processing batch of {len(grants_data)} grants with AI")
        ai_response = helpers.ai_extract_data(prompt, model)

        if not ai_response:
            logger.error("No response from AI")
            return []

        # Clean the response
        if ai_response.startswith("```json"):
            ai_response = ai_response.replace("```json", "").replace("```", "").strip()

        processed_grants = json.loads(ai_response)

        if not isinstance(processed_grants, list):
            logger.error("AI response is not a list")
            return []

        logger.info(f"Successfully processed {len(processed_grants)} grants with AI")
        return processed_grants

    except json.JSONDecodeError as e:
        logger.error(f"Error parsing AI response as JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"Error in AI processing: {e}")
        return []


def upsert_nysed_grant(grant_data: Dict, processed_data: Dict, session) -> bool:
    """Upsert a single processed grant into the database."""
    try:
        url = grant_data["url"]
        content_hash = grant_data["content_hash"]

        # Create a unique source_grant_id from the URL
        source_grant_id = hashlib.md5(url.encode("utf-8")).hexdigest()[:16]

        # Check if grant exists and has changed
        existing_grant = (
            session.query(Opportunity)
            .filter_by(source_grant_id=source_grant_id, source="nysed.gov")
            .first()
        )

        # Skip if content hasn't changed
        if (
            existing_grant
            and existing_grant.extra
            and existing_grant.extra.get("content_hash") == content_hash
        ):
            logger.info(f"No changes detected for grant {source_grant_id}")
            return False

        # Create or update opportunity
        if not existing_grant:
            opportunity = Opportunity(
                source_grant_id=source_grant_id,
                source="nysed.gov",
                state_code="NY",
            )
            session.add(opportunity)
            logger.info(f"Creating new grant {source_grant_id}")
        else:
            opportunity = existing_grant
            logger.info(f"Updating existing grant {source_grant_id}")

        # Update opportunity fields from processed data
        opportunity.title = processed_data.get("title", grant_data["title"])
        opportunity.description_summary = processed_data.get("description_summary")
        opportunity.eligibility_summary = processed_data.get("eligibility_summary")
        opportunity.award_min = processed_data.get("award_min")
        opportunity.award_max = processed_data.get("award_max")
        opportunity.total_funding_amount = processed_data.get("total_funding_amount")
        opportunity.contact_name = processed_data.get("contact_name")
        opportunity.contact_email = processed_data.get("contact_email")
        opportunity.contact_phone = processed_data.get("contact_phone")
        opportunity.agency = processed_data.get(
            "agency", "New York State Education Department"
        )
        opportunity.category = processed_data.get("category")
        opportunity.url = url
        opportunity.attachments = grant_data["attachments"]
        opportunity.funding_instrument = "grant"
        opportunity.status = OpportunityStatusEnum.closed
        opportunity.relevance_score = (
            100  # NYSED grants are highly relevant to NY school districts
        )

        # Parse dates
        if processed_data.get("post_date"):
            opportunity.post_date = helpers.parse_date(processed_data["post_date"])
        if processed_data.get("close_date"):
            close_date = helpers.parse_date(processed_data["close_date"])
            opportunity.close_date = close_date
            today = date.today()
            if close_date and close_date >= today:
                opportunity.status = OpportunityStatusEnum.posted
            else:
                opportunity.status = OpportunityStatusEnum.closed

        # Store hash and extra data
        extra_data = processed_data.get("extra", {})
        extra_data["content_hash"] = content_hash
        opportunity.extra = extra_data

        # Generate and populate raw_text using the helper function
        opportunity.raw_text = helpers.format_opportunity_text(opportunity)

        # Print the complete grant object for debugging
        for attr in opportunity.__table__.columns.keys():
            print(f"{attr}: {getattr(opportunity, attr)}")

        session.commit()
        logger.info(
            f"Successfully upserted grant {source_grant_id}: {opportunity.title}"
        )
        return True

    except Exception as e:
        logger.error(f"Error upserting grant: {e}")
        session.rollback()
        return False


def main():
    """Main function to orchestrate the NYSED grant scraping process."""
    logger.info("Starting NYSED grant scraping process")

    with flask_app.app_context():
        session = db.session

        try:
            # Step 1: Extract all grant URLs
            grant_urls = extract_grant_urls(GRANTS_LISTING_URL)

            if not grant_urls:
                logger.warning("No grant URLs found")
                return

            # Step 2: Extract raw data from each grant page
            all_grants_data = []
            for url in grant_urls:
                grant_data = extract_grant_data(url)
                if grant_data:
                    all_grants_data.append(grant_data)

            logger.info(
                f"Successfully extracted data from {len(all_grants_data)} grants"
            )

            # Step 3: Process grants in batches with AI
            batch_size = 5  # Process 5 grants per AI call to stay within token limits
            updated_count = 0

            for i in range(0, len(all_grants_data), batch_size):
                batch = all_grants_data[i : i + batch_size]
                processed_grants = batch_process_grants_with_ai(batch)

                # Step 4: Upsert each processed grant
                for j, processed_data in enumerate(processed_grants):
                    if j < len(batch):
                        original_grant = batch[j]
                        if upsert_nysed_grant(original_grant, processed_data, session):
                            updated_count += 1

            logger.info(
                f"NYSED grant scraping completed. Updated {updated_count} grants."
            )

        except Exception as e:
            logger.error(f"Error in main scraping process: {e}")
            session.rollback()


if __name__ == "__main__":
    main()
