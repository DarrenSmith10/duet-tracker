"use client";

import { useEffect } from "react";

import {
  autoResetDailyIfNeeded,
  autoResetWeeklyIfNeeded,
  getNextDailyResetIso,
  getNextWeeklyResetIso,
} from "@/lib/activityReset";
import { scheduleClientNotification } from "@/lib/push/clientSchedule";
import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";

export default function ActivityAutoReset() {
  useEffect(() => {
    const dailyReset = autoResetDailyIfNeeded();
    const weeklyReset = autoResetWeeklyIfNeeded();

    if (dailyReset) {
      pushSaveKeyToSupabase("dailyTasks").catch(() => {});

      scheduleClientNotification({
        notificationKey: `daily-reset-${getNextDailyResetIso().slice(0, 10)}`,
        type: "daily-reset",
        title: "Dailies Reset",
        body: "Your dailies have reset. Time to play.",
        url: "/daily-notes",
        notifyAt: getNextDailyResetIso(),
      }).catch(() => {});
    }

    if (weeklyReset) {
      pushSaveKeyToSupabase("weeklyTasks").catch(() => {});

      scheduleClientNotification({
        notificationKey: `weekly-reset-${getNextWeeklyResetIso().slice(0, 10)}`,
        type: "weekly-reset",
        title: "Weeklies Reset",
        body: "Your weeklies have reset. Time to play.",
        url: "/daily-notes",
        notifyAt: getNextWeeklyResetIso(),
      }).catch(() => {});
    }
  }, []);

  return null;
}
