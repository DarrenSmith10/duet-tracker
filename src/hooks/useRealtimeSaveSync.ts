"use client";

import { useEffect, useRef, useState } from "react";

import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  pullRealtimeSaveKeysFromSupabase,
  pushAllRealtimeSaveKeys,
  subscribeToRealtimeSaves,
  unsubscribeRealtimeSaves,
} from "@/lib/supabase/realtimeSync";

export function useRealtimeSaveSync() {
  const [status, setStatus] = useState("Realtime sync idle.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  async function uploadAll() {
    setIsSyncing(true);
    setStatus("Uploading local data to realtime sync...");

    try {
      await pushAllRealtimeSaveKeys();
      const timestamp = new Date().toISOString();
      setLastSyncedAt(timestamp);
      setStatus("Realtime upload complete.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Realtime upload failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function downloadAll() {
    setIsSyncing(true);
    setStatus("Downloading realtime save data...");

    try {
      await pullRealtimeSaveKeysFromSupabase();
      const timestamp = new Date().toISOString();
      setLastSyncedAt(timestamp);
      setStatus("Realtime download complete. Refresh the app.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Realtime download failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function startRealtimeSync() {
    if (channelRef.current) {
      setStatus("Realtime sync is already running.");
      return;
    }

    setStatus("Starting realtime sync...");

    try {
      channelRef.current = await subscribeToRealtimeSaves({
        onChange: () => {
          const timestamp = new Date().toISOString();
          setLastSyncedAt(timestamp);
          setStatus("Realtime update received. Refresh page if needed.");
          window.dispatchEvent(new Event("dna-realtime-save-updated"));
        },
      });

      setStatus("Realtime sync enabled.");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Could not start realtime sync.");
    }
  }

  async function stopRealtimeSync() {
    if (!channelRef.current) {
      setStatus("Realtime sync is not running.");
      return;
    }

    try {
      await unsubscribeRealtimeSaves(channelRef.current);
      channelRef.current = null;
      setStatus("Realtime sync stopped.");
    } catch (error) {
      console.error(error);
      setStatus("Could not stop realtime sync.");
    }
  }

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        unsubscribeRealtimeSaves(channelRef.current);
      }
    };
  }, []);

  return {
    status,
    isSyncing,
    lastSyncedAt,
    uploadAll,
    downloadAll,
    startRealtimeSync,
    stopRealtimeSync,
  };
}
