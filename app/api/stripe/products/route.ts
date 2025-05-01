import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Only available server-side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: '2025-03-31.basil',
});

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Fetch all active products
    const products = await stripe.products.list({ active: true });
    // Fetch all prices (recurring only, for subscription plans)
    const prices = await stripe.prices.list({ active: true, expand: ['data.product'] });

    // Map prices to products
    const plans = prices.data
      .filter((price) => price.type === 'recurring' && price.product && typeof price.product !== 'string')
      .map((price) => {
        const product = price.product as Stripe.Product;
        let features: string[] = [];
        try {
          if (product.metadata.features) {
            // Expecting features as a JSON array string in metadata
            features = JSON.parse(product.metadata.features);
          } else if (product.metadata.feature_1) {
            // Fallback: Collect feature_1, feature_2, ...
            features = Object.keys(product.metadata)
              .filter((k) => k.startsWith('feature_'))
              .sort()
              .map((k) => product.metadata[k]);
          }
        } catch (e) {
          console.warn(`Failed to parse features for product ${product.id}:`, e);
          features = [];
        }
        return {
          id: price.id, // Price ID
          productId: product.id,
          name: product.name,
          description: product.description || product.metadata.description || '',
          price: (price.unit_amount || 0) / 100,
          currency: price.currency,
          interval: price.recurring?.interval || 'month',
          intervalCount: price.recurring?.interval_count || 1,
          features,
          metadata: product.metadata,
          active: product.active && price.active,
          highlight: product.metadata.highlight === 'true',
        };
      });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    let errorMessage = 'Failed to fetch products from Stripe';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}