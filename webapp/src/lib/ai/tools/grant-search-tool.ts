import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { searchGrants } from "../vector-store";
import { DistrictInfo } from "../prompts/grants-assistant";

export function createGrantSearchTool(districtInfo: DistrictInfo | null) {
  return new DynamicStructuredTool({
    name: "search_grants",
    description: `Search for grant funding opportunities in the database. 
Use this when the user asks to find, search for, or get recommendations on grants.
The search uses semantic similarity to find relevant opportunities based on the query meaning.
${districtInfo?.state ? `The district is located in ${districtInfo.state}.` : ""}
${districtInfo?.enrollment ? `The district has ${districtInfo.enrollment} students enrolled.` : ""}`,

    schema: z.object({
      query: z
        .string()
        .describe(
          "The search query describing what type of grants to find. " +
            "Include program focus (STEM, arts, special education, technology, etc.), " +
            "target population (early childhood, high school, multilingual learners), " +
            "and any specific needs or priorities mentioned by the user."
        ),
      stateCode: z
        .string()
        .optional()
        .describe(
          "Two-letter state code to filter grants (e.g., 'MA', 'NY', 'CA'). Use 'US' for federal grants. " +
            "If the district has a state, prefer that state's grants unless user specifies otherwise."
        ),
      status: z
        .enum(["posted", "forecasted", "closed"])
        .optional()
        .describe(
          "Grant status filter. Use 'posted' for currently open grants (default), " +
            "'forecasted' for upcoming opportunities, 'closed' for past grants."
        ),
    }),

    func: async ({ query, stateCode, status }) => {
      console.log(`🔧 Tool invoked: search_grants`);
      console.log(`   Query: "${query}"`);
      console.log(`   State: ${stateCode || districtInfo?.state || "any"}`);
      console.log(`   Status: ${status || "posted"}`);

      try {
        const results = await searchGrants(query, {
          stateCode: stateCode || districtInfo?.state || undefined,
          status: status || "posted",
        });

        if (results.length === 0) {
          return JSON.stringify({
            success: true,
            count: 0,
            message:
              "No grants found matching the criteria. Try broadening your search or adjusting filters.",
          });
        }

        // Format results for the LLM
        const formattedResults = {
          success: true,
          count: results.length,
          grants: results.map((r) => ({
            id: r.metadata.opportunity_id,
            title: r.metadata.title,
            agency: r.metadata.agency || "N/A",
            source: r.metadata.source,
            status: r.metadata.status,
            state: r.metadata.state_code || "N/A",
            amount: r.metadata.total_funding_amount
              ? `$${r.metadata.total_funding_amount.toLocaleString()}`
              : r.metadata.award_min && r.metadata.award_max
                ? `$${r.metadata.award_min.toLocaleString()} - $${r.metadata.award_max.toLocaleString()}`
                : "Amount not specified",
            deadline: r.metadata.close_date
              ? new Date(r.metadata.close_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "No deadline specified",
            posted: r.metadata.post_date
              ? new Date(r.metadata.post_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A",
            categories: r.metadata.category?.join(", ") || "N/A",
            funding_instrument: r.metadata.funding_instrument || "N/A",
            url: r.metadata.url || "N/A",
            excerpt:
              r.content.substring(0, 400) +
              (r.content.length > 400 ? "..." : ""),
          })),
        };

        console.log(`✅ Tool returning ${results.length} grants`);
        return JSON.stringify(formattedResults, null, 2);
      } catch (error) {
        console.error("❌ Tool error:", error);
        return JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while searching grants",
        });
      }
    },
  });
}
