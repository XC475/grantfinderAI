/**
 * Data Migration Script for Model Switcher Feature
 * 
 * This script:
 * 1. Creates default FREE subscriptions for all existing organizations
 * 2. Sets default model preferences ("gpt-4o-mini") for all existing users
 * 
 * Run with: npx tsx scripts/migrate-model-switcher-data.ts
 */

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Model Switcher data migration...\n");

  // 1. Create default FREE subscriptions for organizations without subscriptions
  console.log("📦 Step 1: Creating default FREE subscriptions for organizations...");
  
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  console.log(`   Found ${organizations.length} organizations`);

  let subscriptionsCreated = 0;
  let subscriptionsSkipped = 0;

  for (const org of organizations) {
    const existingSubscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId: org.id },
    });

    if (existingSubscription) {
      subscriptionsSkipped++;
      continue;
    }

    await prisma.organizationSubscription.create({
      data: {
        organizationId: org.id,
        tier: "FREE",
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
    });

    subscriptionsCreated++;
  }

  console.log(`   ✅ Created ${subscriptionsCreated} new subscriptions`);
  console.log(`   ⏭️  Skipped ${subscriptionsSkipped} organizations (already have subscriptions)\n`);

  // 2. Set default model preferences for users without model settings
  console.log("👤 Step 2: Setting default model preferences for users...");

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`   Found ${users.length} users`);

  let settingsCreated = 0;
  let settingsUpdated = 0;
  let settingsSkipped = 0;

  for (const user of users) {
    const existingSettings = await prisma.userAIContextSettings.findUnique({
      where: { userId: user.id },
    });

    if (existingSettings) {
      // Check if model preferences are already set (and not default)
      const hasModelPreferences =
        (existingSettings.selectedModelChat &&
          existingSettings.selectedModelChat !== "gpt-4o-mini") ||
        (existingSettings.selectedModelEditor &&
          existingSettings.selectedModelEditor !== "gpt-4o-mini");

      if (hasModelPreferences) {
        settingsSkipped++;
        continue;
      }

      // Update existing settings to include model preferences if missing
      await prisma.userAIContextSettings.update({
        where: { userId: user.id },
        data: {
          selectedModelChat: existingSettings.selectedModelChat || "gpt-4o-mini",
          selectedModelEditor: existingSettings.selectedModelEditor || "gpt-4o-mini",
        },
      });

      settingsUpdated++;
    } else {
      // Create new settings with defaults
      await prisma.userAIContextSettings.create({
        data: {
          userId: user.id,
          enableOrgProfileChat: true,
          enableOrgProfileEditor: true,
          enableKnowledgeBaseChat: true,
          enableKnowledgeBaseEditor: true,
          enableGrantSearchChat: true,
          enableGrantSearchEditor: true,
          selectedModelChat: "gpt-4o-mini",
          selectedModelEditor: "gpt-4o-mini",
        },
      });

      settingsCreated++;
    }
  }

  console.log(`   ✅ Created ${settingsCreated} new AI settings records`);
  console.log(`   🔄 Updated ${settingsUpdated} existing settings with model preferences`);
  console.log(`   ⏭️  Skipped ${settingsSkipped} users (already have model preferences)\n`);

  // 3. Verify the migration
  console.log("🔍 Step 3: Verifying migration...");

  const totalOrganizations = await prisma.organization.count();
  const totalSubscriptions = await prisma.organizationSubscription.count();
  const totalUsers = await prisma.user.count();
  const totalSettings = await prisma.userAIContextSettings.count();
  const usersWithModelPrefs = await prisma.userAIContextSettings.count({
    where: {
      selectedModelChat: "gpt-4o-mini",
      selectedModelEditor: "gpt-4o-mini",
    },
  });

  console.log(`   Organizations: ${totalOrganizations}`);
  console.log(`   Subscriptions: ${totalSubscriptions}`);
  console.log(`   Users: ${totalUsers}`);
  console.log(`   AI Settings: ${totalSettings}`);
  console.log(`   Users with model preferences: ${usersWithModelPrefs}\n`);

  if (totalSubscriptions === totalOrganizations && usersWithModelPrefs === totalUsers) {
    console.log("✅ Migration completed successfully! All organizations and users are configured.\n");
  } else {
    console.log("⚠️  Migration completed with some discrepancies. Please review the counts above.\n");
  }
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

