"use client";

import { use, useEffect, useState } from "react";

import {
  buildDailyResetNotification,
  buildRollingResetNotification,
  buildWeeklyResetNotification,
  notifyOncePerReset,
  requestResetNotificationPermission,
} from "@/lib/resetNotifications";

import { subscribeToPush } from "@/lib/push";

import {
  MONTHLY_RESET_STORAGE_KEY,
  getTrackerNextResetDate,
  type RollingResetTracker,
} from "@/lib/monthlyReset";

function getRollingTrackers() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(MONTHLY_RESET_STORAGE_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as RollingResetTracker[];
  } catch {
    return [];
  }
}

export default function ResetNotificationWatcher() {
  type ResetPermissionSatus = NotificationPermission | "unsupported";
  
  const [permission, setPermission] = useState<ResetPermissionSatus>("default");

  async function enableNotifications() {
  try {
    await subscribeToPush();

    if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  } catch (error) {
    console.error(error);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }
}

  useEffect(() => {
    if (!("Notification" in window)){
      setPermission("unsupported");
      return;
    }
      setPermission(Notification.permission);
  }, []);
  
  useEffect(() => {
    function checkResets() {
      notifyOncePerReset(buildDailyResetNotification());
      notifyOncePerReset(buildWeeklyResetNotification());

      const rollingTrackers = getRollingTrackers();

      rollingTrackers.forEach((tracker) => {
        notifyOncePerReset(
          buildRollingResetNotification({
            id: tracker.id,
            title: tracker.title,
            nextResetAt: getTrackerNextResetDate(tracker),
          })
        );
      });
    }

    checkResets();

    const interval = window.setInterval(checkResets, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Reset Notifications</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Get notified when Daily, Weekly, Mystic Maze Shop, Fishing Shop,
            Immersive Theatre, and Geniemon resets are ready.
          </p>
        </div>

        <button
  type="button"
  onClick={enableNotifications}
  disabled={permission === "granted"}
  className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950"
>
  {permission === "granted" ? "Notifications Enabled" : "Enable Notifications"}
</button>
      </div>

      {permission === "denied" && (
        <p className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
          Notifications are blocked. Enable them in your browser or iPhone PWA settings.
        </p>
      )}
    </section>
  );
}
