"""backend/scripts/helpers.py
Helper functions for backend scripts."""

from datetime import datetime
import hashlib
from dotenv import load_dotenv
from openai import OpenAI
from typing import Union
import os
from dateutil import parser
import pytz

# Load environment variables
load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)


def parse_date(date_str: str) -> Union[datetime.date, None]:
    """Parse a date string into a date object. Returns None if parsing fails.
    Supports formats like "MM/DD/YYYY", "Month Day, Year", "Weekday, Month Day, Year",
    "Mon DD, YYYY HH:MM:SS AM/PM TZ", and "YYYY-MM-DD-HH-MM-SS".
    """

    if not date_str:
        return None

    try:
        parsed_datetime = parser.parse(date_str)
        # Convert to UTC if timezone is present
        if parsed_datetime.tzinfo:
            parsed_datetime = parsed_datetime.astimezone(pytz.UTC)
        return parsed_datetime.date()
    except ValueError:
        pass

    # Explicitly handle "%Y-%m-%d-%H-%M-%S" format as a fallback
    try:
        return datetime.strptime(date_str, "%Y-%m-%d-%H-%M-%S").date()
    except ValueError:
        return None


def ai_extract_data(prompt: str, model: str) -> str | None:
    """Extract relevant data from the scraped details using AI techniques."""
    """
    Send scraped grant data to AI model for parsing and processing.
    """

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error communicating with OpenRouter: {e}")
        return None


def format_opportunity_text(opportunity):
    """
    Format an opportunity object into structured text for the raw_text column.
    """
    text_parts = []

    # Add each field if it exists and has a value
    text_parts.append(f"Opportunity ID: {opportunity.id}")
    text_parts.append(f"Source: {opportunity.source}")

    if opportunity.source_grant_id:
        text_parts.append(f"Source Grant ID: {opportunity.source_grant_id}")

    # Handle status - could be enum or string
    status_value = (
        getattr(opportunity.status, "value", opportunity.status)
        if opportunity.status
        else "Unknown"
    )
    text_parts.append(f"Status: {status_value}")
    text_parts.append(f"Title: {opportunity.title}")

    if opportunity.agency:
        text_parts.append(f"Agency: {opportunity.agency}")

    if opportunity.category:
        # Handle category array - could be array of enums or array of strings
        if hasattr(opportunity.category, "__iter__") and not isinstance(
            opportunity.category, str
        ):
            # It's an array/list
            category_values = [
                getattr(cat, "value", cat) for cat in opportunity.category
            ]
            text_parts.append(f"Category: {', '.join(category_values)}")
        else:
            # It's a single value
            category_value = getattr(
                opportunity.category, "value", opportunity.category
            )
            text_parts.append(f"Category: {category_value}")

    if opportunity.funding_instrument:
        text_parts.append(f"Funding Instrument: {opportunity.funding_instrument}")

    if opportunity.funding_type:
        # Handle funding_type - could be enum or string
        funding_type_value = getattr(
            opportunity.funding_type, "value", opportunity.funding_type
        )
        text_parts.append(f"Funding Type: {funding_type_value}")

    if opportunity.state_code:
        text_parts.append(f"State: {opportunity.state_code}")

    if opportunity.fiscal_year:
        text_parts.append(f"Fiscal Year: {opportunity.fiscal_year}")

    if opportunity.description_summary:
        text_parts.append(f"Summary: {opportunity.description_summary}")

    if opportunity.description:
        text_parts.append(f"Description: {opportunity.description}")

    if opportunity.total_funding_amount:
        text_parts.append(f"Total Funding: ${opportunity.total_funding_amount:,}")

    if opportunity.award_min:
        text_parts.append(f"Award Minimum: ${opportunity.award_min:,}")

    if opportunity.award_max:
        text_parts.append(f"Award Maximum: ${opportunity.award_max:,}")

    if opportunity.cost_sharing is not None:
        cost_sharing_text = "Yes" if opportunity.cost_sharing else "No"
        text_parts.append(f"Cost Sharing Required: {cost_sharing_text}")

    if opportunity.post_date:
        if hasattr(opportunity.post_date, "strftime"):
            # It's a date object
            text_parts.append(f"Posted: {opportunity.post_date.strftime('%Y-%m-%d')}")
        else:
            # It's already a string
            text_parts.append(f"Posted: {opportunity.post_date}")

    if opportunity.close_date:
        if hasattr(opportunity.close_date, "strftime"):
            # It's a date object
            text_parts.append(f"Closes: {opportunity.close_date.strftime('%Y-%m-%d')}")
        else:
            # It's already a string
            text_parts.append(f"Closes: {opportunity.close_date}")

    if opportunity.eligibility_summary:
        text_parts.append(f"Eligibility Summary: {opportunity.eligibility_summary}")

    if opportunity.eligibility:
        text_parts.append(f"Eligibility Details: {opportunity.eligibility}")

    if opportunity.contact_name:
        text_parts.append(f"Contact: {opportunity.contact_name}")

    if opportunity.contact_email:
        text_parts.append(f"Email: {opportunity.contact_email}")

    if opportunity.contact_phone:
        text_parts.append(f"Phone: {opportunity.contact_phone}")

    if opportunity.url:
        text_parts.append(f"URL: {opportunity.url}")

    # Join all parts with newlines
    return "\n".join(text_parts)


def calculate_content_hash(content: str) -> str:
    """Calculate MD5 hash of content for change detection."""
    return hashlib.md5(content.encode("utf-8")).hexdigest()


def update_opportunity_from_json(opportunity, json_data):
    """
    Update an Opportunity object's attributes from JSON data.
    Designed to work with the scraping agent's JSON schema output.

    Args:
        opportunity: Opportunity model instance to update
        json_data: Dictionary/JSON with field names matching Opportunity attributes

    Returns:
        The updated opportunity object

    Example:
        json_data = {
            "source_grant_id": "644H",
            "status": "posted",
            "title": "Grant Title",
            "category": ["Teacher_Professional_Development"],
            "close_date": "2025-10-23",
            "award_max": 10000
        }
        update_opportunity_from_json(opportunity, json_data)
    """
    if not json_data:
        return opportunity

    # Import enums here to avoid circular imports
    from models_sql.opportunity import (
        OpportunityStatusEnum,
        FundingTypeEnum,
        OpportunityCategoryEnum,
    )

    # Handle date fields that need special parsing
    date_fields = {"post_date", "close_date", "archive_date", "last_updated"}

    for field_name, field_value in json_data.items():
        # Skip if field doesn't exist on the model
        if not hasattr(opportunity, field_name):
            print(
                f"Warning: Field '{field_name}' not found in Opportunity model, skipping"
            )
            continue

        # Handle None values
        if field_value is None:
            setattr(opportunity, field_name, None)
            continue

        # Handle empty strings as None for optional fields
        if field_value == "" and field_name not in ["title", "source_grant_id"]:
            setattr(opportunity, field_name, None)
            continue

        try:
            # Handle date fields
            if field_name in date_fields:
                if isinstance(field_value, str):
                    parsed_date = parse_date(field_value)
                    setattr(opportunity, field_name, parsed_date)
                else:
                    setattr(opportunity, field_name, field_value)

            # Handle status field (convert string to enum)
            elif field_name == "status":
                if isinstance(field_value, str):
                    try:
                        status_enum = OpportunityStatusEnum(field_value)
                        setattr(opportunity, field_name, status_enum)
                    except ValueError:
                        print(
                            f"Warning: Invalid status value '{field_value}', skipping"
                        )
                        continue
                else:
                    setattr(opportunity, field_name, field_value)

            # Handle funding_type field (convert string to enum)
            elif field_name == "funding_type":
                if isinstance(field_value, str):
                    try:
                        funding_enum = FundingTypeEnum(field_value)
                        setattr(opportunity, field_name, funding_enum)
                    except ValueError:
                        print(
                            f"Warning: Invalid funding_type value '{field_value}', skipping"
                        )
                        continue
                else:
                    setattr(opportunity, field_name, field_value)

            # Handle category field (convert list of strings to enum array)
            elif field_name == "category":
                if isinstance(field_value, list):
                    try:
                        # Debug: Print what we received
                        print(f"DEBUG: Processing category field_value: {field_value}")

                        # Check if this looks like a character array instead of category strings
                        if len(field_value) > 1 and all(
                            len(str(item)) == 1 for item in field_value
                        ):
                            # This looks like "Other" was split into ['O', 't', 'h', 'e', 'r']
                            # Try to reconstruct the string
                            reconstructed = "".join(field_value)
                            print(
                                f"DEBUG: Reconstructed category from chars: '{reconstructed}'"
                            )
                            field_value = [reconstructed]

                        # Convert string values to enum objects
                        category_enums = []
                        for category_str in field_value:
                            try:
                                # Clean up the category string
                                category_str = str(category_str).strip()
                                if not category_str:
                                    continue

                                category_enum = OpportunityCategoryEnum(category_str)
                                category_enums.append(category_enum)
                                print(
                                    f"DEBUG: Successfully converted '{category_str}' to enum"
                                )
                            except ValueError:
                                print(
                                    f"Warning: Invalid category value '{category_str}', trying to map to valid category"
                                )
                                # Try to find a close match or default to 'Other'
                                if category_str.lower() in [
                                    "other",
                                    "others",
                                    "general",
                                    "misc",
                                    "miscellaneous",
                                ]:
                                    category_enums.append(OpportunityCategoryEnum.Other)
                                    print(f"DEBUG: Mapped '{category_str}' to 'Other'")
                                else:
                                    print(
                                        f"DEBUG: Could not map '{category_str}', skipping"
                                    )
                                    continue

                        # If we didn't get any valid categories, default to 'Other'
                        if not category_enums:
                            print(
                                "DEBUG: No valid categories found, defaulting to 'Other'"
                            )
                            category_enums = [OpportunityCategoryEnum.Other]

                        setattr(opportunity, field_name, category_enums)
                        print(f"DEBUG: Final category enums: {category_enums}")
                    except Exception as e:
                        print(
                            f"Warning: Failed to process categories {field_value}: {e}"
                        )
                        # Default to 'Other' on any error
                        setattr(
                            opportunity, field_name, [OpportunityCategoryEnum.Other]
                        )
                        continue
                elif isinstance(field_value, str):
                    # Handle single string category
                    try:
                        category_enum = OpportunityCategoryEnum(field_value.strip())
                        setattr(opportunity, field_name, [category_enum])
                    except ValueError:
                        print(
                            f"Warning: Invalid single category value '{field_value}', defaulting to 'Other'"
                        )
                        setattr(
                            opportunity, field_name, [OpportunityCategoryEnum.Other]
                        )
                else:
                    # Fallback for any other type
                    print(
                        f"Warning: Unexpected category type {type(field_value)}: {field_value}, defaulting to 'Other'"
                    )
                    setattr(opportunity, field_name, [OpportunityCategoryEnum.Other])

            # Handle all other fields directly
            else:
                setattr(opportunity, field_name, field_value)

        except Exception as e:
            print(
                f"Warning: Failed to set field '{field_name}' to '{field_value}': {e}"
            )
            continue

    return opportunity


def smart_scrape_pipeline(
    html_content: str,
    page_url: str,
    opportunity_template: dict,
    db_session,
    force_update: bool = False,
    commit: bool = True,
    use_lightweight: bool = False,
):
    """
    Intelligent scraping pipeline that:
    1. Checks if opportunity exists in DB by URL
    2. Compares content hashes to detect changes
    3. Uses existing/template fields as preloaded data for AI
    4. Only calls AI when necessary (new or changed content)
    5. Returns status info about what happened

    Args:
        html_content: Raw HTML content
        page_url: URL of the grant page
        opportunity_template: Dict with predefined fields (e.g., {"source": "mass_dese", "funding_type": "state"})
        db_session: Database session
        force_update: Force AI extraction even if content hash matches
        commit: Whether to commit changes
        use_lightweight: Use lightweight extraction

    Returns:
        Dict with keys: "action", "opportunity", "reason"
        - action: "created", "updated", "skipped"
        - opportunity: The Opportunity object (or existing one if skipped)
        - reason: Human readable explanation

    Example:
        result = smart_scrape_pipeline(
            html_content=page_html,
            page_url="https://doe.mass.edu/grants/grant123",
            opportunity_template={
                "source": "doe.mass.edu",
                "funding_type": "state",
                "state_code": "MA",
                "relevance_score": 100
            },
            db_session=db.session
        )
        print(f"Action: {result['action']} - {result['reason']}")
    """
    from models_sql.opportunity import Opportunity

    # Calculate content hash
    content_hash = calculate_content_hash(html_content)

    # Check if opportunity already exists by URL
    existing_opportunity = db_session.query(Opportunity).filter_by(url=page_url).first()

    if existing_opportunity and not force_update:
        # Check if content has changed
        if existing_opportunity.content_hash == content_hash:
            return {
                "action": "skipped",
                "opportunity": existing_opportunity,
                "reason": f"Content unchanged (hash: {content_hash[:8]}...)",
            }
        else:
            # Content has changed - update existing opportunity
            print(f"Content changed for {page_url}, updating...")

            # Prepare preloaded data from existing opportunity + template
            preloaded_data = dict(
                opportunity_template
            )  # Template can override existing values
            preloaded_data["url"] = page_url  # Ensure URL is set

            # Extract new data using AI
            extracted_data = extract_with_preloaded(
                html_content=html_content,
                page_url=page_url,
                preloaded_data=preloaded_data,
                use_lightweight=use_lightweight,
            )

            # Create new opportunity
            opportunity = Opportunity()

            # Apply template fields first
            for field_name, field_value in opportunity_template.items():
                if hasattr(opportunity, field_name):
                    setattr(opportunity, field_name, field_value)

            # Apply extracted data
            update_opportunity_from_json(opportunity, extracted_data)

            # Set metadata
            opportunity.url = page_url  # Ensure URL is set
            opportunity.content_hash = content_hash
            opportunity.raw_text = format_opportunity_text(opportunity)

            # Add to database session
            db_session.add(opportunity)

            # DEBUG: Print whole Opportunity object with attributes
            print(f"Updated Opportunity: {opportunity.__dict__}")

            if commit:
                db_session.commit()

            return {
                "action": "updated",
                "opportunity": opportunity,
                "reason": f"Content changed, updated with new hash: {content_hash[:8]}...",
            }

    else:
        # Create new opportunity (doesn't exist or forced update)
        print(f"Creating new opportunity for {page_url}...")

        # Prepare preloaded data from template
        preloaded_data = dict(opportunity_template)
        preloaded_data["url"] = page_url

        # If force_update and existing opportunity, use its data as preloaded
        if force_update and existing_opportunity:
            existing_preloaded = opportunity_to_preloaded_dict(existing_opportunity)
            existing_preloaded.update(preloaded_data)  # Template overrides existing
            preloaded_data = existing_preloaded

        # Extract data using AI scraping agent
        extracted_data = extract_with_preloaded(
            html_content=html_content,
            page_url=page_url,
            preloaded_data=preloaded_data,
            use_lightweight=use_lightweight,
        )

        if force_update and existing_opportunity:
            # Update existing opportunity
            update_opportunity_from_json(existing_opportunity, extracted_data)
            existing_opportunity.content_hash = content_hash
            existing_opportunity.raw_text = format_opportunity_text(
                existing_opportunity
            )
            existing_opportunity.last_updated = datetime.utcnow()

            if commit:
                db_session.commit()

            return {
                "action": "updated",
                "opportunity": existing_opportunity,
                "reason": "Forced update completed",
            }
        else:
            # Create new opportunity
            opportunity = Opportunity()

            # Apply template fields first
            for field_name, field_value in opportunity_template.items():
                if hasattr(opportunity, field_name):
                    setattr(opportunity, field_name, field_value)

            # Apply extracted data
            update_opportunity_from_json(opportunity, extracted_data)

            # Set metadata
            opportunity.url = page_url  # Ensure URL is set
            opportunity.content_hash = content_hash
            opportunity.raw_text = format_opportunity_text(opportunity)

            # Add to database
            db_session.add(opportunity)

            # DEBUG: Print whole Opportunity object with attributes
            print(f"Created Opportunity: {opportunity.__dict__}")

            if commit:
                db_session.commit()

            return {
                "action": "created",
                "opportunity": opportunity,
                "reason": "New opportunity created",
            }


def opportunity_to_preloaded_dict(opportunity):
    """
    Convert an Opportunity object to a dictionary suitable for preloaded data.
    Only includes non-None values that would be useful for the AI.
    """
    preloaded = {}

    # List of fields that are useful for AI preloading
    useful_fields = [
        "title",
        "description",
        "source",
        "source_grant_id",
        "url",
        "funding_type",
        "status",
        "categories",
        "award_amount_min",
        "award_amount_max",
        "total_funding_available",
        "fiscal_year",
        "application_deadline",
        "award_start_date",
        "award_end_date",
        "state_code",
        "eligibility_criteria",
        "agency_name",
        "program_name",
        "cfda_number",
        "contact_email",
        "contact_phone",
        "opportunity_number",
        "relevance_score",
    ]

    for field in useful_fields:
        if hasattr(opportunity, field):
            value = getattr(opportunity, field)
            if value is not None:
                # Convert dates to strings
                if hasattr(value, "strftime"):
                    preloaded[field] = value.strftime("%Y-%m-%d")
                # Convert arrays to lists
                elif hasattr(value, "__iter__") and not isinstance(value, str):
                    preloaded[field] = list(value)
                else:
                    preloaded[field] = value

    return preloaded


def extract_with_preloaded(
    html_content: str,
    page_url: str,
    preloaded_data: dict,
    use_lightweight: bool = False,
):
    """
    Extract opportunity data using the scraping agent with preloaded data.
    """
    from scraping_agent import OpportunityExtractionAgent

    agent = OpportunityExtractionAgent()

    if use_lightweight:
        return agent.extract_opportunity_lightweight(
            html=html_content, page_url=page_url, preloaded=preloaded_data
        )
    else:
        return agent.extract_opportunity(
            html=html_content, page_url=page_url, preloaded=preloaded_data
        )


def batch_smart_scrape_pipeline(
    html_data_list: list,
    opportunity_template: dict,
    db_session,
    force_update: bool = False,
    commit: bool = True,
    use_lightweight: bool = False,
    post_dates: list = None,
):
    """
    Batch version of smart_scrape_pipeline for processing multiple grants efficiently.

    Args:
        html_data_list: List of dicts with 'html' and 'url' keys
        opportunity_template: Default template for all opportunities
        db_session: Database session
        force_update: Force updates even if content unchanged
        commit: Whether to commit changes
        use_lightweight: Use lightweight extraction
        post_dates: Optional list of post dates (strings) corresponding to each URL in html_data_list

    Returns:
        Dict with statistics and details:
        {
            "stats": {"created": 0, "updated": 0, "skipped": 0, "errors": 0},
            "results": [list of individual results]
        }
    """
    stats = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}
    results = []

    for i, item in enumerate(html_data_list):
        try:
            # Handle item-specific templates
            item_template = dict(opportunity_template)
            if "template" in item:
                item_template.update(item["template"])

            # Add post_date to template if provided
            if post_dates and i < len(post_dates) and post_dates[i]:
                # Convert date object to string if needed
                post_date = post_dates[i]
                if hasattr(post_date, "strftime"):
                    # It's a date object, convert to YYYY-MM-DD string
                    post_date_str = post_date.strftime("%Y-%m-%d")
                else:
                    # It's already a string
                    post_date_str = str(post_date)

                item_template["post_date"] = post_date_str

            result = smart_scrape_pipeline(
                html_content=item["html"],
                page_url=item["url"],
                opportunity_template=item_template,
                db_session=db_session,
                force_update=force_update,
                commit=True,  # Commit per item to avoid large transactions
                use_lightweight=use_lightweight,
            )

            stats[result["action"]] += 1
            results.append(result)
            print(f"✅ {result['action'].upper()}: {result['reason']}")

        except Exception as e:
            # Rollback the session on error to clear any failed transaction state
            try:
                db_session.rollback()
                print("🔄 Rolled back session after error")
            except Exception as rollback_error:
                print(f"Warning: Failed to rollback session: {rollback_error}")

            stats["errors"] += 1
            error_result = {
                "action": "error",
                "opportunity": None,
                "reason": f"Error: {str(e)}",
                "url": item.get("url", "unknown"),
            }
            results.append(error_result)
            print(f"❌ ERROR processing {item.get('url', 'unknown')}: {e}")

    # Commit all changes at once if requested
    if commit:
        try:
            db_session.commit()
            print("💾 Committed all changes to database")
        except Exception as e:
            db_session.rollback()
            print(f"❌ Failed to commit: {e}")
            raise

    return {"stats": stats, "results": results}
