"""backend/scripts/fetch_grants_nysed.py
Script to fetch and process grants from the New York State Education Department website.
Updated to support Firecrawl agent.
"""

import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
from helpers import batch_smart_scrape_pipeline, parse_date
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db
import re

flask_app = server.create_app()

load_dotenv()


def fetch_nysed_urls():
    """Fetch all grant URLs and post dates from the NYSED grants page."""
    url = "https://www.nysed.gov/funding-opportunities/grants"

    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    urls = []
    post_dates = []

    # Find all divs with class 'field__item'
    for div in soup.find_all("div", class_="field__item"):
        for link in div.find_all("a", href=True):
            href = link["href"]
            full_url = urljoin(url, href) if href.startswith("/") else href
            if full_url not in urls:
                urls.append(full_url)
        for post_date in div.find_all("em", string=True):
            date_str = post_date.get_text(strip=True)
            parsed_date = parse_date(date_str)
            # strip leading "Posted" / "posted on" and common separators, then re-parse if changed
            clean = re.sub(
                r"(?i)^\s*posted(?:\s+on)?\s*[:\-–—]?\s*", "", date_str
            ).strip()
            if clean and clean != date_str:
                parsed_date = parse_date(clean)
            if parsed_date:
                post_dates.append(parsed_date)

    print(f"Found {len(urls)} potential grant URLs")
    print(f"Extracted {len(post_dates)} post dates")

    return urls, post_dates


def main():
    """Use the Firecrawl agent for efficient grant extraction."""
    print("🔥 Using Firecrawl Agent for NYSED")
    print("=" * 50)

    urls, post_dates = fetch_nysed_urls()

    opportunity_template = {
        "source": "nysed.gov",
        "state_code": "NY",
        "agency": "New York State Education Department",
        "funding_instrument": "grant",
        "relevance_score": 100,
        "funding_type": "state",
    }

    with flask_app.app_context():
        session = db.session
        batch_result = batch_smart_scrape_pipeline(
            html_data_list=urls,
            opportunity_template=opportunity_template,
            db_session=session,
            post_dates=post_dates,
            use_firecrawl=True,  # Use Firecrawl agent
        )
        print(f"Firecrawl Agent Results: {batch_result['stats']}")


if __name__ == "__main__":
    main()
