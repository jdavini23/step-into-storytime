import { NextRequest } from 'next/server';
// NOTE: The following imports may show linter errors locally if types are missing, but are correct for Supabase Edge/Next.js environments.
// TODO: Ensure types are available for Stripe SDK and the service file in your environment.
// @ts-expect-error: Ignore missing type declarations for service import in Edge/Next.js environments
import {
  upsertUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
} from '@/lib/supabase/stripeSubscriptionService';

// @ts-expect-error: Ignore missing type declarations for Stripe SDK in Edge/Next.js environments
import Stripe from 'npm:stripe@12.16.0';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
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
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle event types
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await upsertUserSubscription(event.data.object);
        break;
      case 'customer.subscription.updated':
        await updateUserSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await deleteUserSubscription(event.data.object.id);
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
