import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  // Forward the request to the Edge Function
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-webhooks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        ...Object.fromEntries(req.headers),
      },
      body: await req.text(),
    },
  );

  if (!response.ok) {
    console.error("Error forwarding to Edge Function:", await response.text());
    return new NextResponse("Webhook processing failed", { status: 400 });
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
