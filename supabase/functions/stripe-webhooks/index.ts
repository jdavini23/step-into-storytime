import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.24.0?target=deno&deno-std=0.168.0';

// --- Environment Variable Check ---
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

if (!stripeSecretKey) {
  console.error('FATAL: Missing STRIPE_SECRET_KEY environment variable.');
  // Optional: throw an error to prevent the server from starting if misconfigured
  throw new Error('Missing STRIPE_SECRET_KEY');
}
if (!webhookSecret) {
  // Log this, but the check inside the handler is the critical one for request processing
  console.warn('Warning: STRIPE_WEBHOOK_SECRET environment variable not set. Webhook verification will fail.');
  // Consider throwing here too if webhook signing is mandatory for all function starts
  // throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

console.log('Attempting to initialize Stripe...');

// Initialize Stripe - Now guaranteed stripeSecretKey is a string
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

console.log('Stripe client initialized.');
console.log('Stripe Webhook Handler Initialized and Ready');

serve(async (req: Request) => { // Add type Request to req
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  console.log('Received webhook request');

  // Critical check inside the handler, as it might be set but empty etc.
  if (!webhookSecret) {
    console.error('Error: Stripe webhook secret (STRIPE_WEBHOOK_SECRET) is not set correctly for verification.');
    return new Response('Webhook secret not configured.', { status: 500 });
  }

  if (!signature) {
    console.error('Error: Request is missing Stripe-Signature header.');
    return new Response('Missing Stripe signature.', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
    console.log(`Webhook signature verified successfully for event ID: ${event.id}`);

    // Log the event type
    console.log(`Received event: ${event.id}, type: ${event.type}`);

    // --- Handle the event ---
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed for session ID: ${session.id}`);
        // TODO: Retrieve subscription details from session if needed
        // TODO: Update user profile/status in your database (e.g., grant access)
        // Example: await updateUserSubscription(session.customer, session.subscription);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type} for customer: ${subscription.customer}, status: ${subscription.status}`);
        // TODO: Update user subscription status in your database based on subscription.status
        // Example: await updateUserSubscriptionStatus(subscription.customer, subscription.status);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice paid for customer: ${invoice.customer}`);
        // TODO: Update billing records, potentially grant access if payment confirms subscription
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed for customer: ${invoice.customer}`);
        // TODO: Notify user, potentially restrict access if subscription payment fails
        break;
      }
      // ... handle other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err: unknown) { // Handle unknown error type
    let errorMessage = 'Webhook signature verification failed.';
    if (err instanceof Error) {
      errorMessage = `Webhook Error: ${err.message}`;
      console.error(`Webhook signature verification failed: ${err.message}`);
    } else {
      console.error('Webhook signature verification failed with unknown error:', err);
    }
    return new Response(errorMessage, { status: 400 });
  }
});
