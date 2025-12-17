/**
 * Data Migration Script for Model Visibility Feature
 * 
 * This script sets default enabled models for all existing users based on their subscription tier.
 * 
 * Run with: npx tsx scripts/migrate-model-visibility-defaults.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import { getDefaultEnabledModels } from "../src/lib/ai/models";
import type { SubscriptionTier } from "../src/types/subscriptions";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Model Visibility defaults migration...\n");

  // Get all users with their organization subscriptions
  const users = await prisma.user.findMany({
    select: {
      id: true,
      organizationId: true,
      aiContextSettings: {
        select: {
          id: true,
          enabledModelsChat: true,
          enabledModelsEditor: true,
        },
      },
    },
  });

  console.log(`   Found ${users.length} users\n`);

  let newSettingsCount = 0;
  let updatedSettingsCount = 0;
  let skippedSettingsCount = 0;

  for (const user of users) {
    // Get user's subscription tier
    let userTier: SubscriptionTier = "free";
    if (user.organizationId) {
      const subscription = await prisma.organizationSubscription.findUnique({
        where: { organizationId: user.organizationId },
      });
      if (subscription) {
        const tierMap: Record<string, SubscriptionTier> = {
          FREE: "free",
          STARTER: "starter",
          PROFESSIONAL: "professional",
          ENTERPRISE: "enterprise",
        };
        userTier = tierMap[subscription.tier] || "free";
      }
    }

    // Get default enabled models for this tier
    const defaultEnabledModels = getDefaultEnabledModels(userTier);

    if (!user.aiContextSettings) {
      // Create new settings with default enabled models
      await prisma.userAIContextSettings.create({
        data: {
          userId: user.id,
          enabledModelsChat: defaultEnabledModels,
          enabledModelsEditor: defaultEnabledModels,
          // Other defaults will be handled by the API route's DEFAULT_SETTINGS
        },
      });
      newSettingsCount++;
    } else {
      // Check if model visibility fields are null
      const existingSettings = await prisma.userAIContextSettings.findUnique({
        where: { id: user.aiContextSettings.id },
        select: {
          enabledModelsChat: true,
          enabledModelsEditor: true,
        },
      });

      if (
        existingSettings?.enabledModelsChat === null ||
        existingSettings?.enabledModelsEditor === null
      ) {
        // Update only null fields
        await prisma.userAIContextSettings.update({
          where: { id: user.aiContextSettings.id },
          data: {
            enabledModelsChat:
              existingSettings.enabledModelsChat === null
                ? defaultEnabledModels
                : undefined,
            enabledModelsEditor:
              existingSettings.enabledModelsEditor === null
                ? defaultEnabledModels
                : undefined,
          },
        });
        updatedSettingsCount++;
      } else {
        skippedSettingsCount++;
      }
    }
  }

  console.log(`   ✅ Created ${newSettingsCount} new AI settings records`);
  console.log(
    `   🔄 Updated ${updatedSettingsCount} existing settings with model visibility defaults`
  );
  console.log(
    `   ⏭️  Skipped ${skippedSettingsCount} users (already have model visibility preferences)`
  );

  // Verification
  console.log("\n🔍 Verifying migration...");
  const totalUsers = await prisma.user.count();
  const totalAISettings = await prisma.userAIContextSettings.count();
  const usersWithModelVisibility = await prisma.userAIContextSettings.count({
    where: {
      enabledModelsChat: { not: null },
      enabledModelsEditor: { not: null },
    },
  });

  if (
    totalUsers === totalAISettings &&
    totalUsers === usersWithModelVisibility
  ) {
    console.log(
      "\n✅ Migration completed successfully! All users have model visibility preferences."
    );
  } else {
    console.error(
      "\n❌ Migration verification failed. Please check the data manually."
    );
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Total AI settings: ${totalAISettings}`);
    console.log(`   Users with model visibility: ${usersWithModelVisibility}`);
  }
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

