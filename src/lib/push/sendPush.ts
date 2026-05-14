import webpush from "web-push";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contactEmail = process.env.VAPID_CONTACT_EMAIL;

  if (!publicKey || !privateKey || !contactEmail) {
    throw new Error("Missing VAPID environment variables.");
  }

  webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
}

export async function sendPushToAllSubscriptions(payload: PushPayload) {
  configureWebPush();

  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription");

  if (error) throw error;

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
  });

  const subscriptions = data ?? [];

  const results = await Promise.allSettled(
    subscriptions.map((row) => webpush.sendNotification(row.subscription, message))
  );

  const failedEndpoints = results
    .map((result, index) => ({
      result,
      endpoint: subscriptions[index]?.endpoint,
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
    sent: subscriptions.length,
    failed: failedEndpoints.length,
  };
}
