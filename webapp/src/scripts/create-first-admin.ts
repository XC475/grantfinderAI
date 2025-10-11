/**
 * Script to create the first admin user with organization
 *
 * Usage:
 * 1. Set environment variables in .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)
 *
 * 2. Run with tsx:
 *    npx tsx src/scripts/create-first-admin.ts
 *
 * Or with ts-node:
 *    npx ts-node src/scripts/create-first-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import prisma from "../lib/prisma";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createFirstAdmin() {
  console.log("=== Create First Admin User ===\n");

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Missing environment variables");
    console.error("Please set:");
    console.error("  - NEXT_PUBLIC_SUPABASE_URL");
    console.error("  - SUPABASE_SERVICE_ROLE_KEY");
    rl.close();
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Get user input
    const email = await question("Admin email: ");
    const name = await question("Admin name: ");
    const password = await question("Admin password (min 6 chars): ");

    if (!email || !name || !password) {
      console.error("\nError: All fields are required");
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("\nError: Password must be at least 6 characters");
      rl.close();
      process.exit(1);
    }

    console.log("\nCreating admin user...");

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
        },
      });

    if (authError) {
      console.error("\nError creating auth user:", authError.message);
      rl.close();
      process.exit(1);
    }

    console.log("✓ Auth user created");
    const userId = authData.user.id;

    // Wait for database trigger to create app.users record and organization
    console.log(
      "Waiting for database trigger to create user and organization..."
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify user was created by trigger
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!dbUser) {
      console.error("\n❌ Error: Database trigger did not create user record");
      console.error("Please check your Supabase trigger is properly set up");
      rl.close();
      process.exit(1);
    }

    if (!dbUser.organization) {
      console.error("\n❌ Error: Database trigger did not create organization");
      console.error("Please check your Supabase trigger is properly set up");
      rl.close();
      process.exit(1);
    }

    console.log("✓ User and organization created by trigger");

    // Update user to system admin
    const adminUser = await prisma.user.update({
      where: { id: userId },
      data: { system_admin: true },
      include: { organization: true },
    });

    console.log("✓ User set to system admin");

    console.log("\n=== Admin User Created Successfully ===");
    console.log(`ID: ${adminUser.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`System Admin: ${adminUser.system_admin}`);

    if (adminUser.organization) {
      console.log(`Organization: ${adminUser.organization.name}`);
      console.log(`Organization Slug: ${adminUser.organization.slug}`);
      console.log("\n=== Access URLs ===");
      console.log(
        `Dashboard: /private/${adminUser.organization.slug}/dashboard`
      );
      console.log(
        `Admin Panel: /private/${adminUser.organization.slug}/admin/users`
      );
    }

    console.log("\nYou can now login with these credentials.");
  } catch (error) {
    console.error("\nError:", error instanceof Error ? error.message : error);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
createFirstAdmin();
