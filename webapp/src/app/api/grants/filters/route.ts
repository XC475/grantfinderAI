import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/grants/filters - Get unique filter values
export async function GET() {
  try {
    // Get distinct values for dropdown filters
    const [states, agencies, sources, fiscalYears] = await Promise.all([
      // Get unique states
      prisma.$queryRaw<Array<{ state_code: string }>>`
        SELECT DISTINCT state_code 
        FROM public.opportunities 
        WHERE state_code IS NOT NULL 
        ORDER BY state_code
      `,
      // Get unique agencies
      prisma.$queryRaw<Array<{ agency: string }>>`
        SELECT DISTINCT agency 
        FROM public.opportunities 
        WHERE agency IS NOT NULL AND agency != ''
        ORDER BY agency
      `,
      // Get unique sources
      prisma.$queryRaw<Array<{ source: string }>>`
        SELECT DISTINCT source 
        FROM public.opportunities 
        WHERE source IS NOT NULL 
        ORDER BY source
      `,
      // Get unique fiscal years
      prisma.$queryRaw<Array<{ fiscal_year: number }>>`
        SELECT DISTINCT fiscal_year 
        FROM public.opportunities 
        WHERE fiscal_year IS NOT NULL 
        ORDER BY fiscal_year DESC
      `,
    ]);

    return NextResponse.json({
      states: states.map((s) => s.state_code).filter(Boolean),
      agencies: agencies.map((a) => a.agency).filter(Boolean),
      sources: sources.map((s) => s.source).filter(Boolean),
      fiscalYears: fiscalYears.map((f) => f.fiscal_year).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
