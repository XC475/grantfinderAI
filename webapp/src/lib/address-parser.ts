/**
 * Utility functions for parsing Nominatim API address responses
 */

export interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
  [key: string]: string | undefined;
}

/**
 * US State name to abbreviation mapping
 */
const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

/**
 * Converts a full US state name to its abbreviation
 */
function convertStateToAbbreviation(state: string): string {
  // If already an abbreviation (2 characters), return as is
  if (state.length === 2) {
    return state.toUpperCase();
  }

  // Try to find abbreviation
  const abbreviation = STATE_ABBREVIATIONS[state];
  if (abbreviation) {
    return abbreviation;
  }

  // If not found, return original (might be international or already abbreviated)
  return state;
}

/**
 * Parses a Nominatim address object into our address format
 */
export function parseNominatimAddress(
  address: NominatimAddress
): ParsedAddress {
  // Build street address from house_number and road
  const streetParts: string[] = [];
  if (address.house_number) {
    streetParts.push(address.house_number);
  }
  if (address.road) {
    streetParts.push(address.road);
  }
  const streetAddress = streetParts.join(" ").trim() || "";

  // Get city from various possible fields
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "";

  // Get state and convert to abbreviation if needed
  let state = address.state || "";
  if (state) {
    state = convertStateToAbbreviation(state);
  }

  // Get postal code
  const zipCode = address.postcode || "";

  return {
    address: streetAddress,
    city: city,
    state: state,
    zipCode: zipCode,
  };
}

