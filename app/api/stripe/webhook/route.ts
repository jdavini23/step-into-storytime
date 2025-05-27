// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("\n=== New Webhook Request ===");
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  try {
    const body = await req.text();
    console.log("Raw body:", body);

    const signature = req.headers.get("stripe-signature");
    console.log("Signature present:", !!signature);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Supabase URL:", supabaseUrl ? "Present" : "Missing");
    console.log("Service Role Key:", serviceRoleKey ? "Present" : "Missing");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing required environment variables");
    }

    console.log("Forwarding to Edge Function...");
    const response = await fetch(
      `${supabaseUrl}/functions/v1/stripe-webhooks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
          "stripe-signature": signature || "",
        },
        body,
      },
    );

    const responseText = await response.text();
    console.log("Edge Function response status:", response.status);
    console.log("Edge Function response:", responseText);

    if (!response.ok) {
      console.error("Error forwarding to Edge Function:", responseText);
      return new NextResponse(`Webhook processing failed: ${responseText}`, {
        status: response.status,
      });
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse(
      `Webhook error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 },
    );
  }
}
