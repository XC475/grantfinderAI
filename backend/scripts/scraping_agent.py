from openai import OpenAI
import json
from pathlib import Path
from typing import Dict, Any, Optional
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class OpportunityExtractionAgent:
    """
    A generalized agent for extracting opportunity data from HTML using OpenAI's structured output via OpenRouter.
    """

    def __init__(
        self,
        model: str = "anthropic/claude-3.5-sonnet:beta",
        api_key: Optional[str] = None,
    ):
        """
        Initialize the extraction agent.

        Args:
            model: Model to use for extraction (default: claude-3.5-sonnet for better structured output support)
            api_key: OpenRouter API key (if None, uses environment variable)
        """
        self.model = model
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key or os.getenv("OPENROUTER_API_KEY"),
        )
        self.schema = None
        self.field_rules = None

        # Load schema and field rules
        self._load_schemas()

    def _load_schemas(self):
        """Load the JSON schema and field rules from files."""
        try:
            # Resolve schema paths relative to this script file (scripts dir)
            base_dir = Path(__file__).resolve().parent
            schema_path = base_dir / "schemas/OpportunityExtraction.schema.json"
            field_rules_path = (
                base_dir / "schemas/OpportunityExtraction.fieldRules.json"
            )

            with open(schema_path, "r") as f:
                self.schema = json.load(f)

            with open(field_rules_path, "r") as f:
                self.field_rules = json.load(f)

        except FileNotFoundError as e:
            raise FileNotFoundError(
                f"Schema files not found: {e}. Please ensure schemas/ directory exists with required files."
            )
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in schema files: {e}")

    def extract_opportunity_lightweight(
        self,
        html: Optional[str] = None,
        page_url: Optional[str] = None,
        preloaded: Optional[Dict[str, Any]] = None,
        temperature: float = 0,
        timeout: int = 30,
    ) -> Dict[str, Any]:
        """
        Extract opportunity data using a lightweight schema for cost efficiency.
        Only extracts essential fields to minimize token usage.

        Args:
            html: Raw HTML content of the page (if None, will fetch from page_url)
            page_url: URL of the page (required if html is None)
            preloaded: Optional dict of fields that are already known
            temperature: Temperature for the model (0 for deterministic output)
            timeout: Timeout for HTTP requests when fetching HTML

        Returns:
            Dict containing the essential extracted opportunity data
        """
        # If HTML is not provided, fetch it from the URL
        if html is None:
            if page_url is None:
                raise ValueError("Either 'html' or 'page_url' must be provided")

            print(f"Fetching HTML content from: {page_url}")
            html = self._fetch_html(page_url, timeout)

        if not html:
            raise ValueError("HTML content cannot be empty")

        # Set defaults
        page_url = page_url or "https://example.com/unknown"
        preloaded = preloaded or {}

        # Lightweight schema - only essential fields
        lightweight_schema = {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "description": {"type": ["string", "null"]},
                "agency": {"type": ["string", "null"]},
                "category": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                },
                "close_date": {"type": ["string", "null"], "format": "date"},
                "award_max": {"type": ["integer", "null"]},
                "total_funding_amount": {"type": ["integer", "null"]},
                "contact_email": {"type": ["string", "null"]},
                "url": {"type": ["string", "null"]},
            },
            "required": ["title", "category"],
            "additionalProperties": False,
        }

        # Simplified field rules
        lightweight_rules = {
            "title": "Extract the main grant title",
            "description": "Brief description of what this grant funds",
            "agency": "Name of the awarding organization",
            "category": "Choose 1-2 most relevant categories from: STEM_Education, Career_and_Technical_Education, Special_Education, Early_Childhood_Education, Teacher_Professional_Development, Arts_and_Music_Education, Health_and_Wellness, Educational_Technology_Innovation, Other",
            "close_date": "Application deadline in YYYY-MM-DD format",
            "award_max": "Maximum award amount in dollars (integer only)",
            "total_funding_amount": "Total program funding in dollars (integer only)",
            "contact_email": "Email for grant inquiries",
            "url": "Official grant page URL",
        }

        # Construct simplified prompt
        messages = [
            {
                "role": "system",
                "content": "Extract key grant information. Return only valid JSON with essential fields.",
            },
            {
                "role": "user",
                "content": f"URL: {page_url}\nPreloaded: {json.dumps(preloaded)}\nRules: {json.dumps(lightweight_rules)}\n\nHTML:\n{html[:20000]}",  # Truncate HTML to save tokens
            },
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=temperature,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "LightweightOpportunity",
                        "schema": lightweight_schema,
                        "strict": True,
                    },
                },
                messages=messages,
            )

            result_json = response.choices[0].message.content
            return json.loads(result_json)

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            raise Exception(f"Failed to extract opportunity data: {e}")

    def extract_opportunity(
        self,
        html: Optional[str] = None,
        page_url: Optional[str] = None,
        preloaded: Optional[Dict[str, Any]] = None,
        temperature: float = 0,
        timeout: int = 30,
    ) -> Dict[str, Any]:
        """
        Extract opportunity data from HTML using the configured schema.

        Args:
            html: Raw HTML content of the page (if None, will fetch from page_url)
            page_url: URL of the page (required if html is None)
            preloaded: Optional dict of fields that are already known and should not be changed
            temperature: Temperature for the model (0 for deterministic output)
            timeout: Timeout for HTTP requests when fetching HTML

        Returns:
            Dict containing the extracted opportunity data

        Raises:
            ValueError: If both html and page_url are None, or if extraction fails
            Exception: If API call fails or HTTP request fails
        """
        # If HTML is not provided, fetch it from the URL
        if html is None:
            if page_url is None:
                raise ValueError("Either 'html' or 'page_url' must be provided")

            print(f"Fetching HTML content from: {page_url}")
            html = self._fetch_html(page_url, timeout)

        if not html:
            raise ValueError("HTML content cannot be empty")

        # Set defaults
        page_url = page_url or "https://example.com/unknown"
        preloaded = preloaded or {}

        # Construct the prompt
        messages = [
            {
                "role": "system",
                "content": "You are a precise information extractor. Follow the schema and fieldRules exactly. Return only valid JSON that conforms to the provided schema.",
            },
            {
                "role": "user",
                "content": f"PAGE_URL: {page_url}\nPRELOADED_FIELDS_JSON:\n{json.dumps(preloaded, indent=2)}\nFIELD_RULES_JSON:\n{json.dumps(self.field_rules, indent=2)}\nSCHEMA_NAME: Opportunity\nHTML:\n{html}",
            },
        ]

        try:
            # Make the API call
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=temperature,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "Opportunity",
                        "schema": self.schema,
                        "strict": True,
                    },
                },
                messages=messages,
            )

            # Parse and return the result
            result_json = response.choices[0].message.content
            return json.loads(result_json)

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            raise Exception(f"Failed to extract opportunity data: {e}")

    def _fetch_html(self, url: str, timeout: int = 30) -> str:
        """
        Fetch HTML content from a URL.

        Args:
            url: URL to fetch
            timeout: Request timeout in seconds

        Returns:
            Raw HTML content as string

        Raises:
            Exception: If HTTP request fails
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }

            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()

            return response.text

        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch HTML from {url}: {e}")
        except Exception as e:
            raise Exception(f"Unexpected error fetching HTML: {e}")

    def extract_batch_opportunities_single_call(
        self,
        html_pages: list,
        page_urls: Optional[list] = None,
        preloaded_list: Optional[list] = None,
        temperature: float = 0,
        batch_size: int = 5,
    ) -> list:
        """
        Extract opportunity data from multiple HTML pages in a single API call (much more cost-efficient).

        Args:
            html_pages: List of HTML content strings
            page_urls: Optional list of URLs (same length as html_pages)
            preloaded_list: Optional list of preloaded dicts (same length as html_pages)
            temperature: Temperature for the model
            batch_size: Number of pages to process in each API call

        Returns:
            List of extracted opportunity dictionaries
        """
        if not html_pages:
            return []

        # Ensure all lists are the same length
        num_pages = len(html_pages)
        page_urls = page_urls or [
            f"https://example.com/page_{i}" for i in range(num_pages)
        ]
        preloaded_list = preloaded_list or [{}] * num_pages

        if len(page_urls) != num_pages or len(preloaded_list) != num_pages:
            raise ValueError("All input lists must have the same length")

        all_results = []

        # Process in batches
        for batch_start in range(0, num_pages, batch_size):
            batch_end = min(batch_start + batch_size, num_pages)

            batch_html = html_pages[batch_start:batch_end]
            batch_urls = page_urls[batch_start:batch_end]
            batch_preloaded = preloaded_list[batch_start:batch_end]

            try:
                batch_results = self._extract_single_batch(
                    batch_html, batch_urls, batch_preloaded, temperature
                )
                all_results.extend(batch_results)
            except Exception as e:
                print(f"Failed to extract batch {batch_start//batch_size + 1}: {e}")
                # Add None for each failed item in the batch
                all_results.extend([None] * len(batch_html))

        return all_results

    def _extract_single_batch(
        self,
        html_pages: list,
        page_urls: list,
        preloaded_list: list,
        temperature: float = 0,
    ) -> list:
        """
        Extract multiple opportunities in a single API call.

        Returns:
            List of extracted opportunity dictionaries
        """
        # Create batch schema for multiple opportunities
        batch_schema = {
            "type": "object",
            "properties": {
                "opportunities": {
                    "type": "array",
                    "items": self.schema,
                    "minItems": len(html_pages),
                    "maxItems": len(html_pages),
                }
            },
            "required": ["opportunities"],
            "additionalProperties": False,
        }

        # Create batch prompt
        batch_content = []
        for i, (html, url, preloaded) in enumerate(
            zip(html_pages, page_urls, preloaded_list)
        ):
            batch_content.append(f"=== GRANT {i+1} ===")
            batch_content.append(f"PAGE_URL: {url}")
            batch_content.append(f"PRELOADED_FIELDS: {json.dumps(preloaded)}")
            batch_content.append(f"HTML:\n{html}")
            batch_content.append("=" * 50)

        messages = [
            {
                "role": "system",
                "content": f"You are extracting {len(html_pages)} grant opportunities. For each grant, follow the schema and fieldRules exactly. Return a JSON object with an 'opportunities' array containing exactly {len(html_pages)} opportunity objects in the same order as provided.",
            },
            {
                "role": "user",
                "content": f"FIELD_RULES_JSON:\n{json.dumps(self.field_rules, indent=2)}\n\n"
                + "\n".join(batch_content),
            },
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=temperature,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "BatchOpportunities",
                        "schema": batch_schema,
                        "strict": True,
                    },
                },
                messages=messages,
            )

            result_json = response.choices[0].message.content
            batch_result = json.loads(result_json)
            return batch_result["opportunities"]

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse batch AI response as JSON: {e}")
        except Exception as e:
            raise Exception(f"Failed to extract batch opportunity data: {e}")

    def extract_batch_opportunities(
        self,
        html_pages: list,
        page_urls: Optional[list] = None,
        preloaded_list: Optional[list] = None,
        temperature: float = 0,
    ) -> list:
        """
        Extract opportunity data from multiple HTML pages.

        Args:
            html_pages: List of HTML content strings
            page_urls: Optional list of URLs (same length as html_pages)
            preloaded_list: Optional list of preloaded dicts (same length as html_pages)
            temperature: Temperature for the model

        Returns:
            List of extracted opportunity dictionaries
        """
        if not html_pages:
            return []

        # Ensure all lists are the same length
        num_pages = len(html_pages)
        page_urls = page_urls or [None] * num_pages
        preloaded_list = preloaded_list or [{}] * num_pages

        if len(page_urls) != num_pages or len(preloaded_list) != num_pages:
            raise ValueError("All input lists must have the same length")

        results = []
        for i, (html, url, preloaded) in enumerate(
            zip(html_pages, page_urls, preloaded_list)
        ):
            try:
                result = self.extract_opportunity(html, url, preloaded, temperature)
                results.append(result)
            except Exception as e:
                print(f"Failed to extract opportunity {i+1}: {e}")
                results.append(None)  # or could raise, depending on desired behavior

        return results


# Convenience functions for backward compatibility and ease of use
def extract_opportunity_from_html(
    html: str,
    page_url: Optional[str] = None,
    preloaded: Optional[Dict[str, Any]] = None,
    api_key: Optional[str] = None,
    model: str = "anthropic/claude-3.5-sonnet:beta",
) -> Dict[str, Any]:
    """
    Convenience function to extract a single opportunity from HTML.

    Args:
        html: Raw HTML content
        page_url: Optional URL of the page
        preloaded: Optional dict of known fields
        api_key: Optional OpenRouter API key
        model: Model to use for extraction (default: claude-3.5-sonnet for better structured output)

    Returns:
        Dict containing extracted opportunity data
    """
    agent = OpportunityExtractionAgent(api_key=api_key, model=model)
    return agent.extract_opportunity(html, page_url, preloaded)
