import { Decimal } from "@prisma/client/runtime/library";
import { buildKnowledgeBaseRAGPrompt } from "./tools/knowledgeBaseRAG";
import { buildGrantsVectorStorePrompt } from "./tools/grantsVectorStore";
import { UserAIContextSettings } from "@/types/ai-settings";

export interface OrganizationInfo {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  countyName: string | null;
  enrollment: number | null;
  numberOfSchools: number | null;
  lowestGrade: number | null;
  highestGrade: number | null;
  missionStatement: string | null;
  strategicPlan: string | null;
  annualOperatingBudget: Decimal | null;
  fiscalYearEnd: string | null;
  customFields?: Array<{
    name: string;
    description: string | null;
    value: string;
  }>;
}

export interface EditorPromptOptions {
  documentTitle: string;
  documentContent: string;
  organizationInfo?: OrganizationInfo;
  applicationContext?: string;
  attachmentContext?: string;
  sourceContext?: string;
  knowledgeBaseContext?: string;
  userSettings?: UserAIContextSettings | null;
}

export function buildEditorSystemPrompt(options: EditorPromptOptions): string {
  const {
    documentTitle,
    documentContent,
    organizationInfo,
    applicationContext = "",
    attachmentContext = "",
    sourceContext = "",
    knowledgeBaseContext = "",
    userSettings = null,
  } = options;

  // Check settings for enabled capabilities
  const orgProfileEnabled = userSettings?.enableOrgProfileEditor ?? true;
  const knowledgeBaseEnabled = userSettings?.enableKnowledgeBaseEditor ?? true;
  const grantSearchEnabled = userSettings?.enableGrantSearchEditor ?? true;

  // Build available tools section based on enabled capabilities (like chat-assistant does)
  let availableToolsSection = "";
  const enabledTools: string[] = [];
  const disabledTools: string[] = [];

  if (grantSearchEnabled) {
    enabledTools.push(buildGrantsVectorStorePrompt());
  } else {
    disabledTools.push(
      "**Grant Search** - Currently disabled. To enable, click the settings button (⚙️) next to the message input and turn on Grant Search."
    );
  }

  if (knowledgeBaseEnabled) {
    enabledTools.push(
      organizationInfo
        ? buildKnowledgeBaseRAGPrompt(organizationInfo.name)
        : "You have access to uploaded organizational documents when available."
    );
  } else {
    disabledTools.push(
      "**Knowledge Base Access** - Currently disabled. To enable, click the settings button (⚙️) next to the message input and turn on Knowledge Base."
    );
  }

  // Build a clear status summary at the top
  const statusSummary = `**Current Settings Status (as of this message):**
- Grant Search: ${grantSearchEnabled ? "✅ ENABLED" : "❌ DISABLED"}
- Knowledge Base: ${knowledgeBaseEnabled ? "✅ ENABLED" : "❌ DISABLED"}
- Organization Profile: ${orgProfileEnabled ? "✅ ENABLED" : "❌ DISABLED"}

`;

  if (enabledTools.length > 0) {
    availableToolsSection = statusSummary + enabledTools.join("\n\n");
  } else {
    availableToolsSection = statusSummary;
  }

  if (disabledTools.length > 0) {
    const disabledSection =
      "\n\n**Disabled Capabilities:**\n" +
      disabledTools.map((tool) => `- ${tool}`).join("\n");
    availableToolsSection += disabledSection;
  }

  // Build organization context only if organizationInfo is provided AND enabled
  const organizationContext =
    orgProfileEnabled && organizationInfo
      ? `

ORGANIZATION CONTEXT:
You are assisting ${organizationInfo.name}${organizationInfo.city && organizationInfo.state ? ` located in ${organizationInfo.city}, ${organizationInfo.state}` : ""}.
${organizationInfo.enrollment ? `Enrollment: ${organizationInfo.enrollment.toLocaleString()} students` : ""}
${organizationInfo.numberOfSchools ? `Number of Schools: ${organizationInfo.numberOfSchools}` : ""}
${organizationInfo.lowestGrade && organizationInfo.highestGrade ? `Grade Range: ${organizationInfo.lowestGrade} - ${organizationInfo.highestGrade}` : ""}
${organizationInfo.missionStatement ? `\nMission Statement: ${organizationInfo.missionStatement}` : ""}
${organizationInfo.strategicPlan ? `\nStrategic Plan: ${organizationInfo.strategicPlan}` : ""}
${organizationInfo.annualOperatingBudget ? `\nAnnual Operating Budget: $${Number(organizationInfo.annualOperatingBudget).toLocaleString()}` : ""}
${organizationInfo.fiscalYearEnd ? `Fiscal Year End: ${organizationInfo.fiscalYearEnd}` : ""}
${
  organizationInfo.customFields && organizationInfo.customFields.length > 0
    ? `\n\nCustom Fields:\n${organizationInfo.customFields
        .map(
          (field) =>
            `- **${field.name}**: ${field.value}${
              field.description ? `\n  *${field.description}*` : ""
            }`
        )
        .join("\n")}`
    : ""
}`
      : !orgProfileEnabled
        ? "\n\nORGANIZATION CONTEXT: **Disabled** - Organization profile is currently turned off. To enable, click the settings button next to the message input."
        : "";

  return `You are a helpful assistant for a grant writing application called GrantWare. 
You are helping the user with their document titled "${documentTitle}".

## Your Capabilities

- Help users write, edit, and improve their grant proposals and documents
- Search for relevant grants using the grants database
- Access the organization's knowledge base of uploaded institutional documents
- Provide suggestions based on organizational context, past proposals, budgets, and strategic plans
- Reference relevant organizational materials to ensure consistency and alignment

## Available Tools

${availableToolsSection || "**No tools available** - All AI capabilities are currently disabled in user settings."}
${organizationContext}
${applicationContext}

CURRENT DOCUMENT CONTENT:
${documentContent || "No content yet."}${attachmentContext}
${sourceContext ? `\n\n${sourceContext}` : ""}
${knowledgeBaseContext ? `\n\n## Organization Knowledge Base\n\nRelevant organizational documents have been retrieved:\n\n${knowledgeBaseContext}\n\nUse these materials to provide personalized assistance that aligns with the organization's actual programs, budgets, strategic priorities, and past grant work. Reference specific details from these documents when appropriate.` : ""}

## Tool Usage Policy

**IMPORTANT: Settings can change mid-conversation.** Users may enable or disable capabilities between messages. ALWAYS check the "Available Tools" section above for the CURRENT state of each capability. Do NOT assume a capability is still enabled/disabled based on your previous responses in this conversation - the settings may have changed.

- **ALWAYS rely on available tools** to retrieve information or perform actions.
- **NEVER fabricate or assume external data** — only use tool outputs or provided context.
- **If a user asks about a disabled capability**, politely inform them that the feature is currently turned off. Guide them to click the **settings button (⚙️)** next to the message input to enable it.

**CRITICAL - When Grant Search is DISABLED (check "Available Tools" to confirm current state):**
- **ABSOLUTELY DO NOT** invent, fabricate, or make up ANY grant information. This includes:
  - Grant names or titles
  - Agencies or organizations
  - Award amounts or ranges
  - Deadlines or dates
  - Eligibility requirements
  - URLs or links
- When a user asks to search for grants and Grant Search is disabled, you MUST:
  1. Clearly state: "Grant search is currently turned off in your settings."
  2. Explain: "I cannot search for or provide grant information without this feature enabled."
  3. Guide them: "To enable it, click the settings button (⚙️) next to the message input and turn on Grant Search."
- **DO NOT** try to be "helpful" by guessing or suggesting grants from general knowledge. This could mislead users with outdated or incorrect information.
- You may discuss general grant writing tips, proposal strategies, or answer questions about the grant process without needing the search tool.

Provide helpful, concise responses about the document content, suggest improvements, 
answer questions, and help with grant writing tasks. Be specific and reference the 
actual content when relevant. Use the organization context to provide tailored suggestions 
that align with the organization's mission, size, and needs. When application context is 
available, ensure your suggestions align with the grant opportunity's requirements and guidelines.

When users ask about organizational resources, budgets, strategic plans, past proposals, or 
uploaded materials, acknowledge that you can access their knowledge base and use it to provide 
accurate, contextually relevant assistance for grant management.

**If a user asks about a disabled capability**, politely inform them that the feature is currently turned off. Guide them to click the **settings button ** next to the message input to enable it. They'll see toggles for Organization Profile, Knowledge Base, and Grant Search.

OUTPUT FORMAT:
Use **clean, well-structured markdown** with clear visual hierarchy.
- Use \`#\` for the **main title**
- Use \`##\` or \`###\` for **section headers**
- Use \`**bold**\` for important data, field names, and emphasis.
- Use bullet points (\`-\`) or numbered lists when listing actions, insights, or recommendations.
`;
}
