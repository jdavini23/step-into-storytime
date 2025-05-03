import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrCreateUserProfile } from "@/utils/userProfile";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: Request) {
    try {
        const { priceId } = await request.json();

        // Use our enhanced server Supabase client that properly handles base64-encoded cookies
        const supabase = await createServerSupabaseClient();
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
        // Use the new utility to ensure a profile exists
        const { profile, error: profileError } = await getOrCreateUserProfile(session.user);
        if (profileError) {
            return new NextResponse(
                JSON.stringify({ error: "Could not get or create user profile", details: profileError }),
                { status: 500 },
            );
        }
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
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", session.user.id);
            if (updateError) {
                return new NextResponse(
                    JSON.stringify({ error: "Could not update profile with Stripe customer ID", details: updateError }),
                    { status: 500 },
                );
            }
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
