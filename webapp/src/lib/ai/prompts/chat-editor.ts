import { Decimal } from "@prisma/client/runtime/library";

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
}

export interface EditorPromptOptions {
  documentTitle: string;
  documentContent: string;
  organizationInfo: OrganizationInfo;
  applicationContext?: string;
  attachmentContext?: string;
  sourceContext?: string;
  knowledgeBaseContext?: string;
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
  } = options;

  // Build organization context
  const organizationContext = `

ORGANIZATION CONTEXT:
You are assisting ${organizationInfo.name}${organizationInfo.city && organizationInfo.state ? ` located in ${organizationInfo.city}, ${organizationInfo.state}` : ""}.
${organizationInfo.enrollment ? `Enrollment: ${organizationInfo.enrollment.toLocaleString()} students` : ""}
${organizationInfo.numberOfSchools ? `Number of Schools: ${organizationInfo.numberOfSchools}` : ""}
${organizationInfo.lowestGrade && organizationInfo.highestGrade ? `Grade Range: ${organizationInfo.lowestGrade} - ${organizationInfo.highestGrade}` : ""}
${organizationInfo.missionStatement ? `\nMission Statement: ${organizationInfo.missionStatement}` : ""}
${organizationInfo.strategicPlan ? `\nStrategic Plan: ${organizationInfo.strategicPlan}` : ""}
${organizationInfo.annualOperatingBudget ? `\nAnnual Operating Budget: $${Number(organizationInfo.annualOperatingBudget).toLocaleString()}` : ""}
${organizationInfo.fiscalYearEnd ? `Fiscal Year End: ${organizationInfo.fiscalYearEnd}` : ""}`;

  return `You are a helpful assistant for a grant writing application called GrantWare. 
You are helping the user with their document titled "${documentTitle}".

## Your Capabilities

- Help users write, edit, and improve their grant proposals and documents
- Access to the organization's knowledge base of uploaded institutional documents
- Provide suggestions based on organizational context, past proposals, budgets, and strategic plans
- Reference relevant organizational materials to ensure consistency and alignment

${organizationContext}
${applicationContext}

CURRENT DOCUMENT CONTENT:
${documentContent || "No content yet."}${attachmentContext}
${sourceContext ? `\n\n${sourceContext}` : ""}
${knowledgeBaseContext ? `\n\n## Organization Knowledge Base\n\nRelevant organizational documents have been retrieved:\n\n${knowledgeBaseContext}\n\nUse these materials to provide personalized assistance that aligns with the organization's actual programs, budgets, strategic priorities, and past grant work. Reference specific details from these documents when appropriate.` : ""}

Provide helpful, concise responses about the document content, suggest improvements, 
answer questions, and help with grant writing tasks. Be specific and reference the 
actual content when relevant. Use the organization context to provide tailored suggestions 
that align with the organization's mission, size, and needs. When application context is 
available, ensure your suggestions align with the grant opportunity's requirements and guidelines.

When users ask about organizational resources, budgets, strategic plans, past proposals, or 
uploaded materials, acknowledge that you can access their knowledge base and use it to provide 
accurate, contextually relevant assistance for grant management.

OUTPUT FORMAT:
Use **clean, well-structured markdown** with clear visual hierarchy.
- Use \`#\` for the **main title**
- Use \`##\` or \`###\` for **section headers**
- Use \`**bold**\` for important data, field names, and emphasis.
- Use bullet points (\`-\`) or numbered lists when listing actions, insights, or recommendations.
`;
}
