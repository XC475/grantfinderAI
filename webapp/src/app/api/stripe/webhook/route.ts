import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

// Disable body parsing for webhook signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { organizationId, planId } = session.metadata || {};

      if (!organizationId || !planId) {
        console.error("Missing metadata in checkout session", session.id);
        return NextResponse.json({ received: true });
      }

      // Retrieve subscription from Stripe
      const subscription: Stripe.Subscription =
        await stripe.subscriptions.retrieve(session.subscription as string);

      // Map planId to SubscriptionTier
      // "base" -> STARTER, "business" -> PROFESSIONAL
      const tierMapping: Record<
        string,
        "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
      > = {
        base: "STARTER",
        business: "PROFESSIONAL",
      };

      const mappedTier = tierMapping[planId] || "STARTER";

      // Create or update OrganizationSubscription
      await prisma.organizationSubscription.upsert({
        where: { organizationId },
        create: {
          organizationId,
          tier: mappedTier,
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || null,
          currentPeriodStart: new Date(
            (subscription as any).current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            (subscription as any).current_period_end * 1000
          ),
        },
        update: {
          tier: mappedTier,
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || null,
          currentPeriodStart: new Date(
            (subscription as any).current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            (subscription as any).current_period_end * 1000
          ),
        },
      });
    }

    // Handle customer.subscription.updated event
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find organization by stripeCustomerId
      const orgSubscription = await prisma.organizationSubscription.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (orgSubscription) {
        await prisma.organizationSubscription.update({
          where: { id: orgSubscription.id },
          data: {
            currentPeriodStart: new Date(
              (subscription as any).current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            status:
              subscription.status === "active"
                ? "ACTIVE"
                : subscription.status === "trialing"
                  ? "TRIAL"
                  : subscription.status === "canceled" ||
                      subscription.status === "unpaid"
                    ? "CANCELLED"
                    : "EXPIRED",
          },
        });
      }
    }

    // Handle customer.subscription.deleted event
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find organization by stripeCustomerId
      const orgSubscription = await prisma.organizationSubscription.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (orgSubscription) {
        await prisma.organizationSubscription.update({
          where: { id: orgSubscription.id },
          data: {
            status: "CANCELLED",
            cancelAtPeriodEnd: false,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
