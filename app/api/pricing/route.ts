import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
});

export async function GET() {
    try {
        // Fetch all active products
        const products = await stripe.products.list({
            active: true,
            limit: 20,
        });
        // Fetch all active recurring prices
        const prices = await stripe.prices.list({ active: true, limit: 100 });

        // Map prices by product
        const pricesByProduct: Record<string, any[]> = {};
        for (const price of prices.data) {
            if (
                typeof price.product === "string" &&
                price.recurring &&
                price.active
            ) {
                if (!pricesByProduct[price.product]) {
                    pricesByProduct[price.product] = [];
                }
                pricesByProduct[price.product].push({
                    id: price.id,
                    unit_amount: price.unit_amount,
                    currency: price.currency,
                    recurring: price.recurring,
                });
            }
        }

        // Map products to your Product type
        const result = products.data.map((product) => ({
            id: product.id,
            name: product.name,
            tier: product.metadata.tier || product.id, // fallback to id if no tier
            features: product.metadata.features
                ? JSON.parse(product.metadata.features)
                : [],
            prices: pricesByProduct[product.id] || [],
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("[API /api/pricing] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch pricing data" },
            { status: 500 },
        );
    }
}
