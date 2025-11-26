import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { ToolMessage } from "@langchain/core/messages";
import type { ToolCall } from "@langchain/core/messages/tool";
import { createGrantSearchTool } from "@/lib/ai/tools/grant-search-tool";
import { DistrictInfo } from "@/lib/ai/prompts/chat-assistant";

interface RecommendationResult {
  opportunity_id: number;
  opportunity_title: string;
  fit_score: number;
  fit_description: string;
  organization_name: string;
  organization_id: string;
  query_date: string;
}

export async function POST(_req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    // 3. Fetch organization data
    const organization = await prisma.organization.findUnique({
      where: { id: dbUser.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // 4. Validate organization profile completeness
    if (
      !organization.missionStatement ||
      !organization.strategicPlan ||
      !organization.state
    ) {
      return NextResponse.json(
        {
          error:
            "Organization profile incomplete. Please complete your mission statement, strategic plan, and location information.",
        },
        { status: 400 }
      );
    }

    // 5. Prepare district context
    const districtInfo: DistrictInfo | null = organization.leaId
      ? {
          id: organization.id,
          name: organization.name,
          city: organization.city,
          state: organization.state,
          zipCode: organization.zipCode,
          countyName: organization.countyName,
          enrollment: organization.enrollment,
          numberOfSchools: organization.numberOfSchools,
          lowestGrade: organization.lowestGrade,
          highestGrade: organization.highestGrade,
          missionStatement: organization.missionStatement,
          strategicPlan: organization.strategicPlan,
          annualOperatingBudget: organization.annualOperatingBudget
            ? organization.annualOperatingBudget.toString()
            : null,
          fiscalYearEnd: organization.fiscalYearEnd,
        }
      : null;

    // 6. Build the recommendations prompt
    const systemPrompt = buildRecommendationsPrompt(
      districtInfo || {
        id: organization.id,
        name: organization.name,
        city: organization.city,
        state: organization.state,
        zipCode: organization.zipCode,
        countyName: organization.countyName,
        enrollment: organization.enrollment,
        numberOfSchools: organization.numberOfSchools,
        lowestGrade: organization.lowestGrade,
        highestGrade: organization.highestGrade,
        missionStatement: organization.missionStatement,
        strategicPlan: organization.strategicPlan,
        annualOperatingBudget: organization.annualOperatingBudget
          ? organization.annualOperatingBudget.toString()
          : null,
        fiscalYearEnd: organization.fiscalYearEnd,
      }
    );

    // 7. Initialize OpenAI model
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.0,
    });

    // 8. Create grant search tool with organization services
    const organizationServices = organization.services || [];
    const grantSearchTool = createGrantSearchTool(
      districtInfo,
      organizationServices
    );

    // 9. Bind tools to model
    const modelWithTools = model.bindTools([grantSearchTool]);

    // 10. Execute the model with the system prompt
    let fullResponse = "";
    let toolCalls: ToolCall[] = [];

    // First invocation - model decides what tools to call
    const initialResponse = await modelWithTools.invoke([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          "Generate personalized grant recommendations for this organization based on their profile.",
      },
    ]);

    // Check if model wants to call tools
    if (initialResponse.tool_calls && initialResponse.tool_calls.length > 0) {
      toolCalls = initialResponse.tool_calls;

      // Execute each tool call
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall: ToolCall) => {
          try {
            // Execute the tool
            const result = await grantSearchTool.invoke(
              toolCall.args as { query: string; stateCode?: string }
            );

            return new ToolMessage({
              content:
                typeof result === "string" ? result : JSON.stringify(result),
              tool_call_id: toolCall.id || "",
              name: toolCall.name || "search_grants",
            });
          } catch (error) {
            console.error(
              `❌ [Recommendations] Tool ${toolCall.name} failed:`,
              error
            );
            return new ToolMessage({
              content: JSON.stringify({
                error:
                  error instanceof Error
                    ? error.message
                    : "Tool execution failed",
              }),
              tool_call_id: toolCall.id || "",
              name: toolCall.name || "search_grants",
            });
          }
        })
      );

      // Second invocation - model processes tool results and generates recommendations
      const finalResponse = await model.invoke([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Generate personalized grant recommendations for this organization based on their profile.",
        },
        initialResponse,
        ...toolResults,
      ]);

      fullResponse = finalResponse.content as string;
    } else {
      // No tool calls needed, use initial response
      fullResponse = initialResponse.content as string;
    }

    // 11. Parse the JSON response
    let recommendations: RecommendationResult[];
    try {
      // Try to extract JSON from the response
      // Sometimes the model wraps JSON in markdown code blocks
      let jsonContent = fullResponse.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/```\n?/g, "");
      }

      // Parse JSON - expect either a single object or array
      const parsed = JSON.parse(jsonContent);
      recommendations = Array.isArray(parsed) ? parsed : [parsed];
    } catch (parseError) {
      console.error("❌ [Recommendations] Failed to parse JSON:", parseError);
      console.error("Raw response:", fullResponse.substring(0, 500));

      return NextResponse.json(
        {
          error:
            "Failed to parse AI recommendations. The AI did not return valid JSON.",
          raw_response: fullResponse.substring(0, 1000),
        },
        { status: 500 }
      );
    }

    // 12. Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          // Validate required fields
          if (
            !rec.opportunity_id ||
            rec.fit_score === undefined ||
            !rec.fit_description
          ) {
            console.warn(
              "⚠️ [Recommendations] Skipping invalid recommendation:",
              rec
            );
            return null;
          }

          // Check if recommendation exists
          const existing = await prisma.recommendation.findFirst({
            where: {
              organizationId: organization.id,
              opportunityId: rec.opportunity_id.toString(),
            },
          });

          // Create or update recommendation
          const saved = existing
            ? await prisma.recommendation.update({
                where: { id: existing.id },
                data: {
                  fitScore: Math.round(rec.fit_score),
                  fitDescription: rec.fit_description,
                  queryDate: new Date(),
                },
              })
            : await prisma.recommendation.create({
                data: {
                  organizationId: organization.id,
                  opportunityId: rec.opportunity_id.toString(),
                  fitScore: Math.round(rec.fit_score),
                  fitDescription: rec.fit_description,
                  districtName: organization.name,
                  queryDate: new Date(),
                },
              });

          return saved;
        } catch (error) {
          console.error(
            `❌ [Recommendations] Failed to save recommendation for grant #${rec.opportunity_id}:`,
            error
          );
          return null;
        }
      })
    );

    const successCount = savedRecommendations.filter((r) => r !== null).length;

    // 13. Return success response
    return NextResponse.json({
      success: true,
      count: successCount,
      recommendations: savedRecommendations.filter((r) => r !== null),
      message: `Generated ${successCount} grant recommendations`,
    });
  } catch (error) {
    console.error("❌ [Recommendations] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate recommendations",
      },
      { status: 500 }
    );
  }
}

function buildRecommendationsPrompt(districtInfo: DistrictInfo): string {
  const stateCode = districtInfo.state || "US";

  return `<task_summary>
You are a **Grants Recommendations Analyst** for the K–12 school district ${districtInfo.name}.

Goal:
1. ALWAYS evaluate the district profile defined in your context.
2. ALWAYS call your Grants Vector Store tool to retrieve the top 20 grants which correlate with the district profile.
3. ALWAYS evaluate and rank the grants you receive based on how well they fit the district's eligibility, scale, and needs.
4. ALWAYS Return:
 - A **fit_score** (0–100%)  
 - A **fit_description** (a concise, plain-language summary written for a non-technical user explaining why this grant fits)
- The **fit_description** must be **straight to the point** — no introductions, no phrases like "This grant is…" or "The district should…". Just state the fit directly.
</task_summary>

<context>
Below is the user's district information. This data is pulled from their authenticated district profile and represents **real-time context about who you're helping**.
**Critical Usage Instruction:** You should ALWAYS leverage this profile data to ensure recommendation relevance.

**Current District:** ${districtInfo.name}
- **Location:** ${districtInfo.city || "N/A"}, ${stateCode}, ${districtInfo.zipCode || "N/A"}
- **County:** ${districtInfo.countyName || "N/A"}
- **Enrolled Students:** ${districtInfo.enrollment || "N/A"}
- **Grade Levels:** ${districtInfo.lowestGrade || "N/A"} – ${districtInfo.highestGrade || "N/A"}
- **Number of Schools:** ${districtInfo.numberOfSchools || "N/A"}
- **Annual Operating Budget:** ${districtInfo.annualOperatingBudget ? `$${districtInfo.annualOperatingBudget}` : "N/A"}

**Mission Statement:** 
${districtInfo.missionStatement || "Not provided"}

**Strategic Plan:** 
${districtInfo.strategicPlan || "Not provided"}
</context>

<available_tools>
- **Grants Vector Store (search_grants):**  
  ALWAYS call this semantic search engine that indexes thousands of verified grants as text embeddings.  
  Use it to find the most **relevant funding opportunities** based on keywords.  
</available_tools>

<grant_vector_store_tool_call>
  <goal>
    Collect enough focused context to return **<= 20 highly relevant grants** for the district.
  </goal>
  
  <search_input>
    You should ALWAYS use the organization profile's strategic plan, mission statement to generate the best semantic search input for the tool.
    The input should represent the essence of what the user or district is seeking funding for, expressed in natural language that aligns with the provided vector store's embedded grants structures.
    
    When generating the query, extract and incorporate from context:
    - Main funding topic or intent (e.g., literacy, STEM, SEL, CTE, facilities).  
    - Target population(s) (e.g., early grades, high school, multilingual learners, students with disabilities).  
    - Time and budget signals (deadline urgency, award size, or matching fund limits).  
    - Geographic focus (federal, state, local, county).  
    - Disqualifiers (prior-award-only, invite-only, consortium-only, research-only).  
    - Top 3–5 strategic keywords from the district mission or plan.  
    
    Return the generated search input as your query parameter.
  </search_input>

  <search_plan>
    - Run **two parallel semantic searches** to the Grants Vector Store:
    
     1. State Search: Use strategic keywords + intent/topic + population + "${stateCode}" as stateCode parameter
     2. National Search: Use strategic keywords + intent/topic + population + "US" as stateCode parameter

    - Review only top results per query and remove duplicates.  
    - Capture: title, agency, award, deadline, eligibility, and brief fit signals.  
    - Stop early when ~70% of top results converge on the same focus or when ≥8 strong, in-window results appear.  
    - If results are weak, do one refined search (narrow by strategic keywords and geography).
  </search_plan>

  <ranking_and_filters>
    - **Drop immediately:**  
      • Not eligible for public districts/LEAs  
      • Prior-awardees/invite-only  
      • Deadline passed  
    - **Prioritize:**  
      • Matches strategic keywords  
      • Relevant to state/county  
      • First-time-friendly  
      • Reasonable award for district size  
      • Deadline within 14–90 days  
    - **Deprioritize:**  
      • Research-only (unless requested)  
  </ranking_and_filters>

  <assumptions_and_limits>
    - If data is missing, infer the most reasonable assumption and label it as "Assumption."  
    - Never run more than 3 total tool calls.
  </assumptions_and_limits>

  <performance_rules>
    - Use ≤3 total tool calls: 2 main (state + national) + 1 refinement if needed.  
    - Stop after the first batch if ≥8 high-fit grants found.  
  </performance_rules>

  <final_output>
    - Generate the ranked grant list using the defined <output_structure>.  
    - Include one sentence per item explaining *why it fits* the district.  
  </final_output>

  <tool_usage_policy>
    - **ALWAYS rely on available tools** to retrieve information or perform actions.  
    - **NEVER fabricate or assume external data** — only use tool outputs or provided context.  
  </tool_usage_policy>
</grant_vector_store_tool_call>

<output_policy>
You must **ALWAYS output valid JSON** — no markdown, code blocks, or text outside of it.

### STRICT JSON OUTPUT FORMAT:
Return a JSON array of recommendation objects. Each object must follow this structure:

[
  {
    "opportunity_id": <number from tool results>,
    "opportunity_title": "<title from tool results>",
    "fit_score": <0-100 integer>,
    "fit_description": "<concise plain-language summary explaining why this grant fits>",
    "organization_name": "${districtInfo.name}",
    "organization_id": "${districtInfo.id}",
    "query_date": "${new Date().toISOString()}"
  }
]

CRITICAL RULES:
- Return ONLY the JSON array, no other text
- fit_score must be an integer between 0-100
- opportunity_id must be extracted from the tool results (the 'id' field)
- opportunity_title must be extracted from the tool results (the 'title' field)
- fit_description should be concise (2-3 sentences max) and explain WHY the grant fits the district's needs, priorities, and eligibility
- Do NOT include phrases like "This grant is" or "The district should" in fit_description
</output_policy>`;
}
