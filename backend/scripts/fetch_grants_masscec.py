"""Script to fetch and process grant opportunities from the Massachusetts Department of Elementary and Secondary Education website.
Updated to support both original scraping agent and new Firecrawl agent.
"""

import os
from dotenv import load_dotenv
from helpers import batch_smart_scrape_pipeline
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from flask_server import __main__ as server
from flask_server.db import db

flask_app = server.create_app()

load_dotenv()


def main_with_firecrawl_agent():
    """Use the new Firecrawl agent (more efficient, no HTML fetching needed)."""
    print("🔥 Using Firecrawl Agent")
    print("=" * 50)

    # TODO: Replace with actual URLs fetched from the site once the classifier is ready to classify all
    urls = [
        "https://www.masscec.com/program/request-qualifications-technical-assistance-green-school-works",
        "https://www.masscec.com/program/equity-workforce-training",
        "https://www.masscec.com/program/climate-critical-workforce-training",
        "https://www.masscec.com/program/school-bus-advisory-services-program",
        "https://www.masscec.com/program/green-school-works-technical-assistance-services",
        "https://www.masscec.com/program/beta-roadmaps",
    ]

    opportunity_template = {
        "source": "masscec.com",
        "state_code": "MA",
        "agency": "Massachusetts Clean Energy Center",
        "funding_instrument": "grant",
        "funding_type": "state",
        "services": ["k12_education"],
    }

    with flask_app.app_context():
        session = db.session
        batch_result = batch_smart_scrape_pipeline(
            html_data_list=urls,  # Pass URLs directly
            opportunity_template=opportunity_template,
            db_session=session,
            use_firecrawl=True,  # Use Firecrawl agent
        )
        print(f"Firecrawl Agent Results: {batch_result['stats']}")


def main():
    """Main function - choose which agent to use."""
    main_with_firecrawl_agent()


if __name__ == "__main__":
    main()
