"""Script to fetch and process grant opportunities from the Walmart Foundation website.
Updated to support Firecrawl agent.
"""

import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
from helpers import batch_smart_scrape_pipeline
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db

flask_app = server.create_app()

load_dotenv()


def fetch_walmart_urls():
    """Fetch all grant URLs from the Walmart Foundation grants page."""
    url = "https://www.walmart.org/how-we-give/open-applications"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Parse the grants div
    div = soup.find("div", id="container-fa5aae5a7b")
    urls = []

    if div is None:
        print("No div found; no URLs extracted.")
    else:
        seen = set()
        # Extract unique links from the div
        for a in div.find_all("a", href=True):
            href = a["href"].strip()
            if "program-guidelines" not in href:
                continue
            abs_href = urljoin(response.url, href)
            if abs_href not in seen:
                seen.add(abs_href)
                urls.append(abs_href)

        print(f"Found {len(urls)} unique URLs in the div.")

    return urls


def main():
    """Use the Firecrawl agent for efficient grant extraction."""
    print("🔥 Using Firecrawl Agent for Walmart Foundation")
    print("=" * 50)

    urls = fetch_walmart_urls()

    opportunity_template = {
        "source": "walmart.org",
        "state_code": "US",
        "agency": "Walmart Foundation",
        "funding_instrument": "grant",
        "funding_type": "private",
        "status": "posted",
        "relevance_score": 80,
    }

    with flask_app.app_context():
        session = db.session
        batch_result = batch_smart_scrape_pipeline(
            html_data_list=urls,
            opportunity_template=opportunity_template,
            db_session=session,
            use_firecrawl=True,
        )
        print(f"Firecrawl Agent Results: {batch_result['stats']}")


if __name__ == "__main__":
    main()
