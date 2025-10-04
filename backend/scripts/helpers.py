"""backend/scripts/helpers.py
Helper functions for backend scripts."""

from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from typing import Union
import os

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

    formats = [
        "%m/%d/%Y",
        "%B %d, %Y",
        "%A, %B %d, %Y",
        "%b %d, %Y %I:%M:%S %p %Z",  # e.g. "Oct 25, 2026 12:00:00 AM EDT"
        "%Y-%m-%d-%H-%M-%S",         # e.g. "2026-09-25-00-00-00"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    # Try removing weekday prefix if present
    if "," in date_str:
        try:
            cleaned = date_str.split(",", 1)[-1].strip()
            # Try with time and timezone
            try:
                return datetime.strptime(cleaned, "%b %d, %Y %I:%M:%S %p %Z").date()
            except ValueError:
                return datetime.strptime(cleaned, "%B %d, %Y").date()
        except ValueError:
            pass

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
