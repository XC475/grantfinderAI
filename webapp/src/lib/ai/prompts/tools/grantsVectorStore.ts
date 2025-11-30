export function buildGrantsVectorStorePrompt(): string {
  return `- **Grants Vector Store:**  
  Use it to find the most **relevant funding opportunities** based on meaning — not just keywords — by comparing user or district queries to stored grant descriptions, eligibility, and priorities.
  
  The vector store contains grants with the following structure and field types:
  
  **Identifiers & Source:**
  - **Source**: Platform where grant was found (e.g., "grants.gov", "doe.mass.edu", "walmart.org")
  - **Source Grant ID**: Original identifier from source system (e.g., "MP-CPI-25-004", "FY25-STEM-001")
  - **Status**: Lifecycle stage - one of: "forecasted" (announced but not open), "posted" (accepting applications), "closed" (deadline passed), "archive" (historical)
  
  **Basic Info:**
  - **Title**: Official grant program name (e.g., "Promoting Access with a Language Services Assistance Symbol")
  - **Agency**: Administering organization (e.g., "Office of the Assistant Secretary for Health", "Massachusetts Department of Elementary and Secondary Education")
  - **Funding Instrument**: Mechanism type (e.g., "Grant", "Cooperative Agreement", "Contract")
  
  **Classification:**
  - **Funding Type**: Source level - one of: "federal" (U.S. government), "state" (state-level), "local" (city/county), "private" (foundation/corporate)
  - **State**: Geographic scope - two-letter code (e.g., "MA", "NY", "CA") or "US" for nationwide federal programs
  - **Fiscal Year**: Budget year as integer (e.g., 2025, 2026)
  
  **Financial Details:**
  - **Total Funding**: Aggregate amount available across all awards (e.g., "$3,000,000", "$500,000")
  - **Award Range**: Individual award sizes if specified (e.g., "$50,000-$200,000 per district")
  - **Cost Sharing Required**: Whether matching funds needed - "Yes" or "No"
  
  **Timeline:**
  - **Posted**: Publication date in YYYY-MM-DD format (e.g., "2025-04-23")
  - **Closes**: Application deadline in YYYY-MM-DD format (e.g., "2025-07-02")
  
  **Program Details:**
  - **Description**: Full text covering objectives, eligibility, requirements, outcomes, and application process (typically 500-2000 words)
  - **Eligibility**: Who can apply - often includes entity types (e.g., "Public school districts", "Nonprofit organizations", "Charter schools")
  
  **Contact & Links:**
  - **Contact**: Name of program officer (e.g., "Stacey Williams", "Dr. Jane Smith")
  - **Email**: Contact email address (e.g., "OMHGrants@hhs.gov")
  - **Phone**: Contact phone number (e.g., "240-453-8444")
  - **URL**: Direct link to official grant posting (e.g., "https://www.grants.gov/search-results-detail/355830")
  
  **Important**: Each grant also has an \`id\` field (numeric) which is the internal database ID. Always use this \`id\` to construct in-app links, NOT the \`url\` field.`;
}
