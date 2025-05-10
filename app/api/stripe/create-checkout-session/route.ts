import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: Request) {
    try {
        const { priceId } = await request.json();

        // Get the user from Supabase auth
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return new NextResponse(
                JSON.stringify({
                    error: "Not authenticated",
                }),
                { status: 401 },
            );
        }

        // Get or create the customer
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", session.user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            // Create a new customer in Stripe
            const customer = await stripe.customers.create({
                email: session.user.email,
                metadata: {
                    supabase_uid: session.user.id,
                },
            });
            customerId = customer.id;

            // Update the user's profile with their Stripe customer ID
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", session.user.id);
        }

        // Create a checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url:
                `${SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${SITE_URL}/subscription`,
            subscription_data: {
                metadata: {
                    supabase_uid: session.user.id,
                },
            },
            metadata: {
                supabase_uid: session.user.id,
            },
        });

        return new NextResponse(
            JSON.stringify({ url: checkoutSession.url }),
            { status: 200 },
        );
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return new NextResponse(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 },
        );
    }
}
