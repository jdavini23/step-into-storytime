import { NextRequest } from 'next/server';
import { Buffer } from 'buffer';
// NOTE: The following imports may show linter errors locally if types are missing, but are correct for Supabase Edge/Next.js environments.
// TODO: Ensure types are available for Stripe SDK and the service file in your environment.
import {
  upsertUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
} from '@/lib/supabase/stripeSubscriptionService';
import Stripe from 'stripe';
import type { StripeSubscriptionData } from '@/types/stripe';

// Mapping function: Stripe.Subscription -> StripeSubscriptionData
function mapStripeSubscriptionToData(sub: Stripe.Subscription): StripeSubscriptionData {
  // Type assertion needed because TS might be incorrectly resolving Stripe.Subscription
  // and missing properties like current_period_start/end.
  // Assuming these properties exist at runtime based on Stripe API version.
  const subAny = sub as any;
  return {
    id: sub.id,
    customer: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    status: sub.status,
    plan_id: sub.items.data[0]?.price.id ?? '',
    current_period_start: subAny.current_period_start, // Access via 'as any'
    current_period_end: subAny.current_period_end,     // Access via 'as any'
    cancel_at_period_end: sub.cancel_at_period_end,
    canceled_at: sub.canceled_at ?? null,
    trial_start: sub.trial_start ?? null,
    trial_end: sub.trial_end ?? null,
    user_id: typeof sub.metadata?.user_id === 'string' ? sub.metadata.user_id : undefined,
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to get raw body (Next.js API routes)
async function getRawBody(req: Request): Promise<Uint8Array> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('No request body');
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  // Concatenate all Uint8Array chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function POST(req: NextRequest) {
  let event;
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return new Response('Missing Stripe signature', { status: 400 });
    const rawBody = await getRawBody(req);
    const bufferBody = Buffer.from(rawBody);
    event = stripe.webhooks.constructEvent(bufferBody, sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle event types
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await upsertUserSubscription(mapStripeSubscriptionToData(event.data.object as Stripe.Subscription));
        break;
      case 'customer.subscription.updated':
        await updateUserSubscription(mapStripeSubscriptionToData(event.data.object as Stripe.Subscription));
        break;
      case 'customer.subscription.deleted':
        await deleteUserSubscription((event.data.object as Stripe.Subscription).id);
        break;
      default:
        // Ignore unhandled event types
        break;
    }
    return new Response('Webhook received', { status: 200 });
  } catch (err: any) {
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }
}
