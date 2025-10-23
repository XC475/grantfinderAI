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

# Example usage - batch call specific URLs
if __name__ == "__main__":
    # Fetch the main grants listing page
    url = "https://www.doe.mass.edu/grants/current.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Parse the grants table
    table = soup.find(
        "table", id="ctl00_ctl00_ContentPlaceHolder1_cphMain_GridViewDateDue"
    )
    urls = []
    if table is None:
        print("No table found; no URLs extracted.")
    else:
        seen = set()
        for a in table.find_all("a", href=True):
            href = a["href"].strip()
            abs_href = urljoin(response.url, href)
            if abs_href not in seen:
                seen.add(abs_href)
                urls.append(abs_href)
        print(f"Found {len(urls)} unique URLs in the table.")

    apikey = os.getenv("OPENROUTER_API_KEY")
    agent = OpportunityExtractionAgent(api_key=apikey)

    # Fetch HTML for each URL (preserve order)
    html_data_list = []
    for url in urls:
        try:
            print(f"Fetching HTML for: {url}")
            full_html = agent._fetch_html(url, timeout=30)
            soup = BeautifulSoup(full_html, "html.parser")

            # If there can be multiple matching divs, join their inner HTMLs; otherwise use the first
            div = soup.find("div", class_="col-md-9")
            if div:
                inner_html = div.decode_contents()
                html_data_list.append({"url": url, "html": inner_html})
            else:
                print(f"No div.col-md-9 found on {url}; appending empty html.")
                html_data_list.append({"url": url, "html": ""})

        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            # keep placeholder to preserve ordering for batch call
            html_data_list.append({"url": url, "html": ""})

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
        batch_smart_scrape = batch_smart_scrape_pipeline(
            html_data_list=html_data_list,
            opportunity_template=opportunity_template,
            db_session=session,
        )
        print(batch_smart_scrape)
