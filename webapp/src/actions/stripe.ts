"use server";

import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function createCheckoutSession(
  planId: "base" | "business",
  organizationId: string,
  organizationSlug: string
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user is a member of the organization
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      users: {
        some: { id: user.id },
      },
    },
    include: {
      subscription: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Get or create Stripe customer
  let stripeCustomerId: string | null = null;

  if (organization.subscription?.stripeCustomerId) {
    stripeCustomerId = organization.subscription.stripeCustomerId;
  } else {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: organization.email || user.email || undefined,
      metadata: {
        organizationId: organization.id,
      },
    });

    stripeCustomerId = customer.id;

    // Save stripeCustomerId to subscription
    await prisma.organizationSubscription.upsert({
      where: { organizationId: organization.id },
      create: {
        organizationId: organization.id,
        tier: "FREE",
        status: "ACTIVE",
        stripeCustomerId: customer.id,
      },
      update: {
        stripeCustomerId: customer.id,
      },
    });
  }

  // Map plan selection to price ID
  const planPrices = {
    base: process.env.STRIPE_BASE_PLAN!,
    business: process.env.STRIPE_BUSINESS_PLAN!,
  };

  const priceId = planPrices[planId];
  if (!priceId) {
    throw new Error("Invalid plan");
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      organizationId: organization.id,
      planId: planId,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/private/${organizationSlug}/onboarding?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/private/${organizationSlug}/onboarding?payment=cancelled`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}
