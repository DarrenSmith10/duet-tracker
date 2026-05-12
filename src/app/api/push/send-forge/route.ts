import { NextResponse } from "next/server";

import webpush from "web-push";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contactEmail = process.env.VAPID_CONTACT_EMAIL;

  if (!publicKey || !privateKey || !contactEmail) {
    throw new Error("Missing VAPID environment variables.");
  }

  webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
}

async function sendPushToAll(payload: string) {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription");

  if (error) throw error;

  const results = await Promise.allSettled(
    (data ?? []).map((row) =>
      webpush.sendNotification(row.subscription, payload)
    )
  );

  const failedEndpoints = results
    .map((result, index) => ({
      result,
      endpoint: data?.[index]?.endpoint,
    }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ endpoint }) => endpoint)
    .filter(Boolean);

  if (failedEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", failedEndpoints);
  }

  return {
    sent: data?.length ?? 0,
    failed: failedEndpoints.length,
  };
}

export async function POST(request: Request) {
  try {
    configureWebPush();

    const body = await request.json().catch(() => ({}));

    const result = await sendPushToAll(
      JSON.stringify({
        title: body.title || "Forge Complete",
        body: body.body || "Your forge item is ready to claim.",
        url: body.url || "/forge-queue",
      })
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not send forge push." },
      { status: 500 }
    );
  }
}
