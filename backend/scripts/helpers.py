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
