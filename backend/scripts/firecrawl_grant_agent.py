#!/usr/bin/env python3
"""
Firecrawl Grant Extraction Agent - Simplified Version
Provides clean grant data extraction from URLs using Firecrawl.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from firecrawl import FirecrawlApp

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class FirecrawlGrantAgent:
    """
    Simplified Firecrawl-based grant extraction agent.
    Provides comprehensive grant data extraction from URLs.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Firecrawl grant extraction agent.

        Args:
            api_key: Firecrawl API key (if None, uses FIRECRAWL_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Firecrawl API key required. Set FIRECRAWL_API_KEY environment variable."
            )

        self.firecrawl = FirecrawlApp(api_key=self.api_key)
        self.logger = logging.getLogger(__name__)

    def extract_opportunity(
        self, page_url: str = None, preloaded: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Extract comprehensive grant opportunity data from a URL.

        Args:
            page_url: URL of the grant page to extract data from
            preloaded: Optional pre-extracted data to include/override in results

        Returns:
            Dict containing comprehensive grant data with all relevant fields
        """
        if not page_url:
            raise ValueError("page_url is required for extraction")

        self.logger.info(f"🎯 Extracting comprehensive grant data from: {page_url}")

        # Simplified schema that Firecrawl can handle (removing complex nested objects)
        extraction_schema = {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Clean, properly formatted grant title from the page. Look for main page heading (h1/h2), 'Funding Opportunity Title', or title near the identifier.",
                },
                "agency": {
                    "type": "string",
                    "description": "Full name of the awarding agency or organization issuing the grant.",
                },
                "status": {
                    "type": "string",
                    "enum": ["posted", "forecasted", "closed", "archived"],
                    "description": "Current lifecycle status of the opportunity. Use one of the enum values: 'posted' (posted, open, or accepting applications), 'forecasted' (in planning, not yet posted), 'closed' (deadline, close date, or due date has already passed), or 'archived' (only when specifically marked as such).",
                },
                "category": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "STEM_Education",
                            "Math_and_Science_Education",
                            "Career_and_Technical_Education",
                            "Special_Education",
                            "Early_Childhood_Education",
                            "Teacher_Professional_Development",
                            "Leadership_and_Administration_Development",
                            "Social_Emotional_Learning",
                            "School_Climate_and_Culture",
                            "Bullying_Prevention",
                            "School_Safety_and_Security",
                            "Digital_Literacy_and_Technology",
                            "Educational_Technology_Innovation",
                            "After_School_Programs",
                            "Arts_and_Music_Education",
                            "Environmental_Education",
                            "Health_and_Wellness",
                            "Nutrition_and_School_Meals",
                            "Student_Mental_Health",
                            "Equity_and_Inclusion",
                            "Community_Engagement",
                            "Parental_Involvement",
                            "College_and_Career_Readiness",
                            "Civic_and_History_Education",
                            "English_Language_Learners",
                            "Financial_Literacy",
                            "Educational_Research_and_Innovation",
                            "Facilities_and_Infrastructure",
                            "Data_and_Assessment_Initiatives",
                            "Transportation_and_Accessibility",
                            "Other",
                        ],
                    },
                    "minItems": 1,
                    "uniqueItems": True,
                    "description": "One or more education categories that best describe this grant. Use specific terms from the allowed enum list.",
                },
                "award_max": {
                    "type": "number",
                    "description": "Maximum individual award amount in dollars. Look for 'Award Ceiling', 'Maximum Award', or similar fields.",
                },
                "award_min": {
                    "type": "number",
                    "description": "Minimum individual award amount in dollars. Look for 'Award Floor', 'Minimum Award', or similar fields.",
                },
                "post_date": {
                    "type": "string",
                    "description": "Date the opportunity was posted/published in YYYY-MM-DD format. Look for 'Posted Date', 'Publication Date', or 'Release Date'.",
                },
                "close_date": {
                    "type": "string",
                    "description": "Application deadline date in YYYY-MM-DD format. Look for 'Application Due Date', 'Deadline', 'Close Date', or 'Submission Deadline'.",
                },
                "archive_date": {
                    "type": "string",
                    "description": "Date the opportunity was archived or cancelled in YYYY-MM-DD format. Look for 'Archive Date', 'Cancellation Date', or similar fields.",
                },
                "last_updated": {
                    "type": "string",
                    "description": "Date the opportunity was last updated in YYYY-MM-DD format. Look for 'Last Updated', 'Modified Date', or similar fields.",
                },
                "rfp_url": {
                    "type": "string",
                    "description": "DIRECT URL to the official RFP/solicitation document for THIS SPECIFIC GRANT ONLY. MUST meet ALL criteria: 1) URL ends with .pdf/.doc/.docx/.rtf, 2) Link text contains RFP-related terms ('RFP', 'Request for Proposal', 'Solicitation', 'NOFO', 'Funding Opportunity Announcement', 'Full Announcement'), 3) Document appears to be the formal grant solicitation (not general guidelines/applications), 4) Link is specifically associated with this grant opportunity (contains grant ID, title keywords, or fiscal year). REJECT: generic application forms, general program guidelines, unrelated documents, current page URL, grants management sites. Set to null if no qualifying RFP document found.",
                },
                "attachments": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Display name or filename of the attachment.",
                            },
                            "url": {
                                "type": "string",
                                "description": "Absolute URL to the attachment resource.",
                            },
                        },
                        "required": ["name", "url"],
                    },
                    "description": "List of attachment objects/links found ONLY ON the given url page. Each object contains a name and a url for application forms, guidelines, RFPs, and supporting documents. Look for links labeled 'Download', 'Attachment', 'RFP', 'Guidelines', or similar.  Example: [{'name': 'Application Guidelines', 'url': 'https://example.com/guidelines.pdf'}, {'name': 'Eligibility Document', 'url': 'https://example.com/eligibility.docx'}]",
                },
                "description": {
                    "type": "string",
                    "description": "Full description text describing the grant's purpose, scope, activities, and deliverables.",
                },
                "eligibility": {
                    "type": "string",
                    "description": "Raw eligibility requirements text. Look for 'Eligible Applicants', 'Who May Apply', or 'Eligibility Criteria' sections.",
                },
                "fiscal_year": {
                    "type": "number",
                    "description": "Fiscal year for this grant (integer between 1990-2100). Look for 'FY', 'Fiscal Year', or year references in the title.",
                },
                "contact_name": {
                    "type": "string",
                    "description": "Name of the primary contact person for grant inquiries. Look in 'Contact Information' or 'Program Officer' sections.",
                },
                "cost_sharing": {
                    "type": "boolean",
                    "description": "True if cost sharing/matching funds are required, false if explicitly not required. Look for 'Cost Sharing', 'Match Required', or 'Matching Funds' language.",
                },
                "funding_type": {
                    "type": "string",
                    "enum": ["federal", "state", "local", "private"],
                    "description": "Type of funding source: choose one of the enum values based on the issuing agency or explicit funding source statements.",
                },
                "contact_email": {
                    "type": "string",
                    "description": "Primary contact email address for grant inquiries. Should be a valid email format.",
                },
                "contact_phone": {
                    "type": "string",
                    "description": "Primary contact phone number. Normalize to (AAA) BBB-CCCC format if possible, if no phone number specified, set to null.",
                },
                "source_grant_id": {
                    "type": "string",
                    "description": "Official grant identifier from the source system. Look for 'Opportunity Number', 'CFDA/Assistance Listing', 'RFP ID', 'Solicitation Number', 'Grant ID', or 'Funding Opportunity Number (FON)'.",
                },
                "funding_instrument": {
                    "type": "string",
                    "description": "Type of funding mechanism such as 'grant', 'cooperative agreement', 'contract', 'fellowship', etc.",
                },
                "description_summary": {
                    "type": "string",
                    "description": "Concise 20-60 word plain-language summary of the opportunity's purpose, scope, key activities, and expected outcomes.",
                },
                "eligibility_summary": {
                    "type": "string",
                    "description": "Plain English summary of who can apply and key eligibility requirements. Simplify complex eligibility language into clear, actionable criteria.",
                },
                "total_funding_amount": {
                    "type": "number",
                    "description": "Total program funding available across all awards. Look for 'Total Program Funding', 'Available Funds', or 'Funding Pool'.",
                },
                "relevance_score": {
                    "type": "number",
                    "description": "Relevance score (0-100) indicating how relevant this grant is to K-12 school districts.",
                },
                "extra": {
                    "type": "object",
                    "description": "Other useful fields for display; keys are headings, values are strings.",
                    "additionalProperties": {"type": "string"},
                },
            },
            "required": ["title", "agency", "status", "category", "description"],
        }

        # Enhanced extraction prompt with specific field guidance
        extraction_prompt = """Extract comprehensive grant opportunity data from this education funding page:

            CRITICAL EXTRACTION RULES:
            - Extract ALL available information - do not leave fields empty if data exists
            - Use exact dates in YYYY-MM-DD format (convert from any format found)
            - For amounts, extract only numbers (remove $ symbols, commas)
            - For categories, use specific education terms like "STEM_Education", "Teacher_Professional_Development"
            - Set cost_sharing=true ONLY if explicitly stated as required
            - Look for multiple IDs and prefer "Funding Opportunity Number" or "Solicitation Number"
            - Extract complete contact information from any contact sections
            - Include ALL attachments (applications, guidelines, supporting docs) in the attachments list
            - Use null for any fields that cannot be determined from the page
            - If there are multiple deadlines, use the latest deadline in close_date and disclose other deadlines in the eligibility_summary field

            - Use this rubric for relevance_score:
                - 80-100: Clearly K-12/LEA focused or direct school district funding
                - 50-79: Education-related but mixed audiences (e.g., community orgs + schools)
                - 20-49: Tangential to K-12 (e.g., broader public health where schools are eligible)
                - 0-19: Not relevant to K-12/school districts

            Focus on accuracy and completeness - this data feeds into a grant database."""

        try:
            # Use Firecrawl's extract method
            result = self.firecrawl.extract(
                urls=[page_url],
                schema=extraction_schema,
                prompt=extraction_prompt,
                enable_web_search=True,
            )

            # Process the extraction result
            if (
                result
                and hasattr(result, "success")
                and result.success
                and hasattr(result, "data")
                and result.data
            ):
                # Extract data from the response object
                extracted_data = result.data

                # Add metadata
                extracted_data["url"] = page_url

                # Merge with preloaded data if provided
                if preloaded:
                    # Preloaded data takes precedence for existing keys
                    for key, value in preloaded.items():
                        if (
                            value is not None
                        ):  # Only override with non-null preloaded values
                            extracted_data[key] = value

                # Clean up the data
                extracted_data = self._clean_extracted_data(extracted_data)

                self.logger.info(
                    f"✅ Extraction successful: {extracted_data.get('title', 'Unknown')}"
                )
                return extracted_data
            else:
                self.logger.error("❌ No data returned from Firecrawl extraction")
                return self._create_error_result(
                    page_url, "No data returned from extraction"
                )

        except Exception as e:
            self.logger.error(f"❌ Extraction failed: {str(e)}")
            return self._create_error_result(page_url, str(e))

    def _clean_extracted_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize extracted data."""
        if not data:
            return data

        # Ensure attachments is a list
        if "attachments" in data and not isinstance(data["attachments"], list):
            data["attachments"] = []

        # Ensure category is a list
        if "category" in data and not isinstance(data["category"], list):
            if data["category"]:
                data["category"] = [data["category"]]
            else:
                data["category"] = []

        # Convert string numbers to actual numbers
        for field in ["award_max", "award_min", "total_funding_amount", "fiscal_year"]:
            if field in data and isinstance(data[field], str):
                try:
                    if field == "fiscal_year":
                        data[field] = int(data[field])
                    else:
                        data[field] = float(data[field])
                except (ValueError, TypeError):
                    data[field] = None

        # Ensure boolean fields are actually boolean
        if "cost_sharing" in data and not isinstance(data["cost_sharing"], bool):
            data["cost_sharing"] = str(data["cost_sharing"]).lower() in (
                "true",
                "yes",
                "1",
            )

        return data


# For backward compatibility
def create_agent(api_key: Optional[str] = None) -> FirecrawlGrantAgent:
    """Create a FirecrawlGrantAgent instance."""
    return FirecrawlGrantAgent(api_key=api_key)


if __name__ == "__main__":
    # Example usage
    agent = FirecrawlGrantAgent()
    test_url = "https://www.doe.mass.edu/grants/2026/426A"

    print("🧪 Testing Firecrawl Grant Agent")
    print("=" * 50)

    # Test comprehensive extraction
    result = agent.extract_opportunity(page_url=test_url)
    print(f"✅ Extraction completed for: {result.get('title', 'Unknown')}")
    print(f"📋 Agency: {result.get('agency', 'Unknown')}")
    print(f"💰 Funding: ${result.get('total_funding_amount', 'Unknown')}")
    print(f"📅 Deadline: {result.get('close_date', 'Unknown')}")

    print("\n📊 Complete extracted data:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
