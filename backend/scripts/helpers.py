"""backend/scripts/helpers.py
Helper functions for backend scripts."""

from datetime import datetime
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

    text_parts.append(f"Status: {opportunity.status.value}")
    text_parts.append(f"Title: {opportunity.title}")

    if opportunity.agency:
        text_parts.append(f"Agency: {opportunity.agency}")

    if opportunity.category:
        text_parts.append(f"Category: {opportunity.category}")

    if opportunity.funding_instrument:
        text_parts.append(f"Funding Instrument: {opportunity.funding_instrument}")

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
        text_parts.append(f"Posted: {opportunity.post_date.strftime('%Y-%m-%d')}")

    if opportunity.close_date:
        text_parts.append(f"Closes: {opportunity.close_date.strftime('%Y-%m-%d')}")

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
