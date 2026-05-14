import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type ScheduledNotificationInput = {
  userId?: string | null;
  notificationKey?: string | null;
  type: string;
  title: string;
  body: string;
  url?: string;
  notifyAt: string;
};

export async function scheduleNotification(input: ScheduledNotificationInput) {
  const supabase = createServiceSupabaseClient();

  const payload = {
    user_id: input.userId ?? null,
    notification_key: input.notificationKey ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    url: input.url ?? "/",
    notify_at: input.notifyAt,
    sent_at: null,
    updated_at: new Date().toISOString(),
  };

  if (input.notificationKey) {
    const { error } = await supabase
      .from("scheduled_notifications")
      .upsert(payload, {
        onConflict: "user_id,notification_key",
      });

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("scheduled_notifications")
    .insert(payload);

  if (error) throw error;
}

export async function cancelScheduledNotification(notificationKey: string) {
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("notification_key", notificationKey)
    .is("sent_at", null);

  if (error) throw error;
}

export async function getDueScheduledNotifications(limit = 50) {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("scheduled_notifications")
    .select("*")
    .is("sent_at", null)
    .lte("notify_at", new Date().toISOString())
    .order("notify_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data ?? [];
}

export async function markScheduledNotificationSent(id: string) {
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase
    .from("scheduled_notifications")
    .update({
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
