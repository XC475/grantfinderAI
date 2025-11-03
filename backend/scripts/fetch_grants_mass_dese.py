"""Script to fetch and process grant opportunities from the Massachusetts Department of Elementary and Secondary Education website.
Updated to support both original scraping agent and new Firecrawl agent.
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

flask_app = server.create_app()

load_dotenv()


def fetch_mass_dese_urls():
    """Fetch all grant URLs and post dates from the Mass DESE grants page."""
    url = "https://www.doe.mass.edu/grants/current.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Parse the grants table
    table = soup.find(
        "table", id="ctl00_ctl00_ContentPlaceHolder1_cphMain_GridViewDateDue"
    )
    urls = []
    post_dates = []

    if table is None:
        print("No table found; no URLs or row texts extracted.")
    else:
        seen = set()
        # Extract unique links from the table
        for a in table.find_all("a", href=True):
            href = a["href"].strip()
            abs_href = urljoin(response.url, href)
            if abs_href not in seen:
                seen.add(abs_href)
                urls.append(abs_href)

        # Extract text from the 3rd <td> of each <tr> (post date)
        for tr in table.find_all("tr"):
            tds = tr.find_all("td")
            if len(tds) >= 3:
                text = tds[2].get_text(strip=True)
                post_date = parse_date(text)
                post_dates.append(post_date)

        print(f"Found {len(urls)} unique URLs in the table.")
        print(f"Extracted {len(post_dates)} post dates from table rows.")

    return urls, post_dates


def main_with_firecrawl_agent():
    """Use the new Firecrawl agent (more efficient, no HTML fetching needed)."""
    print("🔥 Using Firecrawl Agent")
    print("=" * 50)

    urls, post_dates = fetch_mass_dese_urls()

    opportunity_template = {
        "source": "doe.mass.edu",
        "state_code": "MA",
        "agency": "Massachusetts Department of Elementary and Secondary Education",
        "funding_instrument": "grant",
        "relevance_score": 100,
        "funding_type": "state",
        "status": "posted",
    }

    with flask_app.app_context():
        session = db.session
        batch_result = batch_smart_scrape_pipeline(
            html_data_list=urls,  # Pass URLs directly
            opportunity_template=opportunity_template,
            db_session=session,
            post_dates=post_dates,
            use_firecrawl=True,  # Use Firecrawl agent
        )
        print(f"Firecrawl Agent Results: {batch_result['stats']}")


def main():
    """Main function - choose which agent to use."""
    main_with_firecrawl_agent()


if __name__ == "__main__":
    main()
