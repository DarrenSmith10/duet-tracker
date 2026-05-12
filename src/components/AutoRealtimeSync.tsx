"use client";

import { useEffect, useRef } from "react";

import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  REALTIME_SAVE_KEYS,
  isRealtimeSaveKey,
  type RealtimeSaveKey,
} from "@/lib/realtimeSaveKeys";
import {
  pushSaveKeyToSupabase,
  subscribeToRealtimeSaves,
  unsubscribeRealtimeSaves,
} from "@/lib/supabase/realtimeSync";

const SYNC_DEBOUNCE_MS = 900;

export default function AutoRealtimeSync() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<Record<string, number>>({});
  const originalSetItemRef = useRef<typeof localStorage.setItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    function queueUpload(key: RealtimeSaveKey) {
      window.clearTimeout(timeoutRef.current[key]);

      timeoutRef.current[key] = window.setTimeout(() => {
        pushSaveKeyToSupabase(key).catch(() => {
          // User may not be signed in yet or network may be unavailable.
        });
      }, SYNC_DEBOUNCE_MS);
    }

    async function start() {
      try {
        channelRef.current = await subscribeToRealtimeSaves({
          onChange: () => {
            window.dispatchEvent(new Event("dna-realtime-save-updated"));
          },
        });
      } catch {
        // User may not be signed in yet. Manual Cloud Save page still works.
      }

      if (cancelled) return;

      if (!originalSetItemRef.current) {
        originalSetItemRef.current = localStorage.setItem.bind(localStorage);

        localStorage.setItem = function patchedSetItem(key: string, value: string) {
          originalSetItemRef.current?.(key, value);

          if (isRealtimeSaveKey(key)) {
            queueUpload(key);
          }
        };
      }

      REALTIME_SAVE_KEYS.forEach((key) => {
        if (localStorage.getItem(key) !== null) {
          queueUpload(key);
        }
      });
    }

    start();

    return () => {
      cancelled = true;

      Object.values(timeoutRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      if (channelRef.current) {
        unsubscribeRealtimeSaves(channelRef.current);
      }

      if (originalSetItemRef.current) {
        localStorage.setItem = originalSetItemRef.current;
      }
    };
  }, []);

  return null;
}
