import prisma from "@/lib/prisma";

const DEFAULT_TAGS = [
  "General",
  "Winning Application",
  "Template",
  "Financials and Budget",
];

export async function createDefaultTags(organizationId: string) {
  const tags = await Promise.all(
    DEFAULT_TAGS.map((name) =>
      prisma.documentTag.create({
        data: {
          name,
          organizationId,
        },
      })
    )
  );
  return tags;
}

