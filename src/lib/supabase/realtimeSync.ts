import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  REALTIME_SAVE_KEYS,
  isRealtimeSaveKey,
  type RealtimeSaveKey,
} from "@/lib/realtimeSaveKeys";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type RealtimeSaveRecord = {
  user_id: string;
  save_key: RealtimeSaveKey;
  save_data: unknown;
  updated_at: string;
};

export function readLocalSaveKey(key: RealtimeSaveKey) {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function writeLocalSaveKey(key: RealtimeSaveKey, value: unknown) {
  if (typeof window === "undefined") return;

  if (typeof value === "string") {
    localStorage.setItem(key, value);
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export async function getSignedInUserId() {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  return data.user.id;
}

export async function pushSaveKeyToSupabase(key: RealtimeSaveKey) {
  const supabase = createBrowserSupabaseClient();
  const userId = await getSignedInUserId();

  if (!userId) {
    throw new Error("Not signed in.");
  }

  const saveData = readLocalSaveKey(key);

  const { error } = await supabase.from("realtime_saves").upsert({
    user_id: userId,
    save_key: key,
    save_data: saveData,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function pushAllRealtimeSaveKeys() {
  await Promise.allSettled(
    REALTIME_SAVE_KEYS.map((key) => pushSaveKeyToSupabase(key))
  );
}

export async function pullRealtimeSaveKeysFromSupabase() {
  const supabase = createBrowserSupabaseClient();
  const userId = await getSignedInUserId();

  if (!userId) {
    throw new Error("Not signed in.");
  }

  const { data, error } = await supabase
    .from("realtime_saves")
    .select("save_key, save_data")
    .eq("user_id", userId);

  if (error) throw error;

  (data ?? []).forEach((record) => {
    const key = String(record.save_key);

    if (!isRealtimeSaveKey(key)) return;

    writeLocalSaveKey(key, record.save_data);
  });

  window.dispatchEvent(new Event("dna-realtime-save-updated"));

  return data ?? [];
}

export async function subscribeToRealtimeSaves({
  onChange,
}: {
  onChange?: (record: RealtimeSaveRecord) => void;
}) {
  const supabase = createBrowserSupabaseClient();
  const userId = await getSignedInUserId();

  if (!userId) {
    throw new Error("Not signed in.");
  }

  const channel: RealtimeChannel = supabase
    .channel(`realtime-saves-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "realtime_saves",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const record = payload.new as RealtimeSaveRecord;
        const key = String(record?.save_key);

        if (!isRealtimeSaveKey(key)) return;

        writeLocalSaveKey(key, record.save_data);
        window.dispatchEvent(new Event("dna-realtime-save-updated"));
        onChange?.(record);
      }
    )
    .subscribe();

  return channel;
}

export async function unsubscribeRealtimeSaves(channel: RealtimeChannel) {
  const supabase = createBrowserSupabaseClient();
  await supabase.removeChannel(channel);
}
