"use client";

import { useEffect, useState } from "react";

import { subscribeToPush } from "@/lib/push";

export default function NotificationsPage() {
  const [status, setStatus] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
  const saved = localStorage.getItem("pushNotificationsEnabled") === "true";
  const granted =
    typeof Notification !== "undefined" &&
    Notification.permission === "granted";

  setPushEnabled(saved && granted);
}, []);

  async function enablePush() {
  setStatus("Requesting push notification permission...");

  try {
    await subscribeToPush();

    localStorage.setItem("pushNotificationsEnabled", "true");
    setPushEnabled(true);

    setStatus("Push notifications enabled for this device.");
  } catch (error) {
    console.error(error);

    setStatus(
      error instanceof Error
        ? error.message
        : "Could not enable push notifications."
    );
  }
}

  async function sendTest() {
    setStatus("Sending test push...");

    try {
      const response = await fetch("/api/push/test", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Test push failed.");
      }

      const data = await response.json();

      setStatus(`Test push sent to ${data.sent ?? 0} device(s).`);
    } catch (error) {
      console.error(error);
      setStatus("Could not send test push.");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Push Notifications</h1>
        <p className="mt-2 text-zinc-400">
          Enable real PWA push notifications for this device.
        </p>
      </div>

      <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <div className="grid gap-3 md:grid-cols-2">
          <button
  type="button"
  onClick={enablePush}
  disabled={pushEnabled}
  className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
>
  {pushEnabled ? "Push Notifications Enabled" : "Enable Push Notifications"}
</button>

          <button
            type="button"
            onClick={sendTest}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
          >
            Send Test Push
          </button>
        </div>

        {status && (
          <p className="mt-5 rounded-xl bg-zinc-800 p-4 text-sm text-zinc-300">
            {status}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">iPhone requirements</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-300">
          <li>Open the app from the installed Home Screen PWA.</li>
          <li>The app must be running from HTTPS.</li>
          <li>You must allow notifications when prompted.</li>
        </ul>
      </section>
    </main>
  );
}
