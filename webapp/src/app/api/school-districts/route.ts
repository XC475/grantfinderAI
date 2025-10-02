import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Urban Institute Education Data API base URL
const URBAN_API_BASE = "https://educationdata.urban.org/api/v1";
const CACHE_DURATION_DAYS = 30;

interface UrbanAPIDistrict {
  year: number;
  leaid: string;
  lea_name: string;
  state_leaid: string | null;
  city_location: string | null;
  state_location: string;
  zip_location: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  county_name: string | null;
  enrollment: number | null;
  number_of_schools: number | null;
  lowest_grade_offered: number | null;
  highest_grade_offered: number | null;
  urban_centric_locale: number | null;
}

interface UrbanAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UrbanAPIDistrict[];
}

// GET /api/school-districts - Fetch school districts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state"); // Optional state filter
  const search = searchParams.get("search"); // Optional search term
  const forceRefresh = searchParams.get("refresh") === "true";

  try {
    // Check if we have cached data that's recent
    if (!forceRefresh) {
      const cacheDate = new Date();
      cacheDate.setDate(cacheDate.getDate() - CACHE_DURATION_DAYS);

      const cachedDistricts = await prisma.schoolDistrict.findMany({
        where: {
          ...(state && { stateCode: state }),
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
          lastSynced: {
            gte: cacheDate,
          },
        },
        select: {
          id: true,
          leaId: true,
          name: true,
          stateCode: true,
          city: true,
          enrollment: true,
          numberOfSchools: true,
          countyName: true,
        },
        orderBy: [{ name: "asc" }],
        take: 1000, // Limit results for performance
      });

      if (cachedDistricts.length > 0) {
        return NextResponse.json({
          data: cachedDistricts,
          cached: true,
          count: cachedDistricts.length,
        });
      }
    }

    // If no cache or force refresh, fetch from Urban API
    console.log("[School Districts] Fetching from Urban API...");

    const year = 2022; // Use most recent year available
    let apiUrl = `${URBAN_API_BASE}/school-districts/ccd/directory/${year}/`;

    // Add state filter if provided (using FIPS code)
    if (state) {
      const fipsCode = getStateFIPSCode(state);
      if (fipsCode) {
        apiUrl += `?fips=${fipsCode}`;
      }
    }

    // Fetch first page
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Urban API error: ${response.statusText}`);
    }

    const data: UrbanAPIResponse = await response.json();
    let allDistricts = data.results;

    // For state-specific queries, fetch all pages (smaller dataset)
    // For nationwide queries, just use first page to avoid overwhelming the system
    if (state && data.next) {
      let nextUrl: string | null = data.next;
      let pageCount = 1;
      const maxPages = 50; // Safety limit

      while (nextUrl && pageCount < maxPages) {
        const pageResponse = await fetch(nextUrl);
        if (!pageResponse.ok) break;

        const pageData: UrbanAPIResponse = await pageResponse.json();
        allDistricts = allDistricts.concat(pageData.results);
        nextUrl = pageData.next;
        pageCount++;
      }
    }

    // Transform and cache the districts
    const districtsToCache = allDistricts.map((d) => ({
      leaId: d.leaid,
      name: d.lea_name,
      stateCode: d.state_location,
      stateLeaId: d.state_leaid,
      city: d.city_location,
      zipCode: d.zip_location,
      phone: d.phone,
      latitude: d.latitude,
      longitude: d.longitude,
      countyName: d.county_name,
      enrollment: d.enrollment,
      numberOfSchools: d.number_of_schools,
      lowestGrade: d.lowest_grade_offered,
      highestGrade: d.highest_grade_offered,
      urbanCentricLocale: d.urban_centric_locale,
      year: d.year,
      lastSynced: new Date(),
    }));

    // Batch upsert to database (cache for future use)
    // Use createMany with skipDuplicates for better performance
    await prisma.schoolDistrict.createMany({
      data: districtsToCache,
      skipDuplicates: true,
    });

    // Filter by search term if provided
    let filteredDistricts = districtsToCache;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDistricts = districtsToCache.filter((d) =>
        d.name.toLowerCase().includes(searchLower)
      );
    }

    // Return transformed data
    const responseData = filteredDistricts.map((d) => ({
      id: d.leaId, // Will be updated after insert, but using leaId as temp ID
      leaId: d.leaId,
      name: d.name,
      stateCode: d.stateCode,
      city: d.city,
      enrollment: d.enrollment,
      numberOfSchools: d.numberOfSchools,
      countyName: d.countyName,
    }));

    return NextResponse.json({
      data: responseData.slice(0, 1000), // Limit response size
      cached: false,
      count: responseData.length,
      total: data.count,
    });
  } catch (error) {
    console.error("[School Districts] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch school districts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to convert state code to FIPS code
function getStateFIPSCode(stateCode: string): string | null {
  const fipsCodes: Record<string, string> = {
    AL: "01",
    AK: "02",
    AZ: "04",
    AR: "05",
    CA: "06",
    CO: "08",
    CT: "09",
    DE: "10",
    FL: "12",
    GA: "13",
    HI: "15",
    ID: "16",
    IL: "17",
    IN: "18",
    IA: "19",
    KS: "20",
    KY: "21",
    LA: "22",
    ME: "23",
    MD: "24",
    MA: "25",
    MI: "26",
    MN: "27",
    MS: "28",
    MO: "29",
    MT: "30",
    NE: "31",
    NV: "32",
    NH: "33",
    NJ: "34",
    NM: "35",
    NY: "36",
    NC: "37",
    ND: "38",
    OH: "39",
    OK: "40",
    OR: "41",
    PA: "42",
    RI: "44",
    SC: "45",
    SD: "46",
    TN: "47",
    TX: "48",
    UT: "49",
    VT: "50",
    VA: "51",
    WA: "53",
    WV: "54",
    WI: "55",
    WY: "56",
  };

  return fipsCodes[stateCode.toUpperCase()] || null;
}
