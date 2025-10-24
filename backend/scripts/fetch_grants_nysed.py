"""backend/scripts/fetch_grants_nysed.py
Script to fetch and process grants from the New York State Education Department website."""

import os
from dotenv import load_dotenv
from scraping_agent import OpportunityExtractionAgent
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


def main():
    # Fetch the main grants listing page
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

    apikey = os.getenv("OPENROUTER_API_KEY")
    agent = OpportunityExtractionAgent(api_key=apikey)

    # Fetch HTML for each URL (preserve order)
    html_data_list = []
    for url in urls:
        try:
            full_html = agent._fetch_html(url, timeout=30)
            soup = BeautifulSoup(full_html, "html.parser")

            # If there can be multiple matching divs, join their inner HTMLs; otherwise use the first
            div = soup.find("div", class_="panel-panel panel-col-last75")
            if div:
                inner_html = div.decode_contents()
                html_data_list.append({"url": url, "html": inner_html})
            else:
                print(
                    f"No div.panel-panel.panel-col-last75 found on {url}; appending empty html."
                )
                html_data_list.append({"url": url, "html": ""})

        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            # keep placeholder to preserve ordering for batch call
            html_data_list.append({"url": url, "html": ""})

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
        batch_smart_scrape = batch_smart_scrape_pipeline(
            html_data_list=html_data_list,
            opportunity_template=opportunity_template,
            db_session=session,
            post_dates=post_dates,
        )
        print(batch_smart_scrape)


if __name__ == "__main__":
    main()
