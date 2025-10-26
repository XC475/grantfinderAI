"""Script to fetch and process grant opportunities from the Massachusetts Department of Elementary and Secondary Education website."""

import os
from dotenv import load_dotenv
from scraping_agent import OpportunityExtractionAgent
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


def main():
    # Fetch the main grants listing page
    url = "https://www.walmart.org/how-we-give/open-applications"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Parse the grants div
    div = soup.find("div", id="container-fa5aae5a7b")
    urls = []
    post_dates = []
    if div is None:
        print("No div found; no URLs or row texts extracted.")
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
        print(f"Extracted {len(post_dates)} post dates from div rows.")

    apikey = os.getenv("OPENROUTER_API_KEY")
    agent = OpportunityExtractionAgent(api_key=apikey)

    # Fetch HTML for each URL (preserve order)
    html_data_list = []
    for url in urls:
        try:
            full_html = agent._fetch_html(url, timeout=30)
            soup = BeautifulSoup(full_html, "html.parser")

            # Find all matching divs and join their inner HTMLs into one entry
            divs = soup.select(
                "div.richtext.aem-GridColumn.aem-GridColumn--default--12"
            )
            if divs:
                inner_html = "\n".join(d.decode_contents() for d in divs)
                html_data_list.append({"url": url, "html": inner_html})
            else:
                print(f"No div.richtext... found on {url}; appending empty html.")
                html_data_list.append({"url": url, "html": ""})

        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            # keep placeholder to preserve ordering for batch call
            html_data_list.append({"url": url, "html": ""})

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
        batch_smart_scrape = batch_smart_scrape_pipeline(
            html_data_list=html_data_list,
            opportunity_template=opportunity_template,
            db_session=session,
            post_dates=post_dates,
        )
        print(batch_smart_scrape)


if __name__ == "__main__":
    main()
