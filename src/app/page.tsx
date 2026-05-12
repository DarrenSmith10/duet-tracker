"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  getDashboardDailyProgressFromStorage,
  getDashboardWeeklyProgressFromStorage,
  type DashboardProgress,
} from "@/lib/dashboardProgress";

type ForgeQueueItem = {
  id: string;
  itemName?: string;
  itemCategory?: string;
  quantity?: number;
  startedAt?: string;
  durationMinutes?: number;
  claimed?: boolean;
};

function readLocalStorageArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(key);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getRemainingMs(item: ForgeQueueItem) {
  if (!item.startedAt || !item.durationMinutes) return 0;

  const startedAt = new Date(item.startedAt).getTime();
  const finishAt = startedAt + item.durationMinutes * 60 * 1000;

  return Math.max(finishAt - Date.now(), 0);
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function ProgressCard({
  title,
  progress,
  accent = "amber",
}: {
  title: string;
  progress: DashboardProgress;
  accent?: "amber" | "blue";
}) {
  const barClass =
    accent === "amber"
      ? "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-100"
      : "bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-100";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="text-lg text-zinc-400">{title}</p>
        <p className="text-lg text-zinc-400">{progress.percent}%</p>
      </div>

      <p className="text-5xl font-black">
        {progress.current}/{progress.target}
      </p>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{
            width: `${progress.percent}%`,
          }}
        />
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
      <p className="text-zinc-400">{title}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-500">{description}</p>
    </section>
  );
}

export default function DashboardPage() {
  const [dailyProgress, setDailyProgress] = useState<DashboardProgress>({
    current: 0,
    target: 200,
    percent: 0,
  });

  const [weeklyProgress, setWeeklyProgress] = useState<DashboardProgress>({
    current: 0,
    target: 0,
    percent: 0,
  });

  const [forgeQueue, setForgeQueue] = useState<ForgeQueueItem[]>([]);
  const [now, setNow] = useState(Date.now());

  function refreshDashboard() {
    setDailyProgress(getDashboardDailyProgressFromStorage());
    setWeeklyProgress(getDashboardWeeklyProgressFromStorage());
    setForgeQueue(readLocalStorageArray<ForgeQueueItem>("forgeQueue"));
  }

  useEffect(() => {
    refreshDashboard();

    window.addEventListener("focus", refreshDashboard);
    window.addEventListener("dna-realtime-save-updated", refreshDashboard);

    return () => {
      window.removeEventListener("focus", refreshDashboard);
      window.removeEventListener("dna-realtime-save-updated", refreshDashboard);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const activeForgeQueue = useMemo(
    () => forgeQueue.filter((item) => !item.claimed),
    [forgeQueue]
  );

  const completedForgeCount = useMemo(
    () =>
      activeForgeQueue.filter((item) => getRemainingMs(item) <= 0).length,
    [activeForgeQueue, now]
  );

  const nextForge = useMemo(() => {
    const active = activeForgeQueue
      .filter((item) => getRemainingMs(item) > 0)
      .sort((a, b) => getRemainingMs(a) - getRemainingMs(b));

    return active[0];
  }, [activeForgeQueue, now]);

  const latestForgeItems = activeForgeQueue.slice(0, 3);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Daily memo progress, weekly trackers, and forge timer overview.
        </p>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Forge Timers"
          value={activeForgeQueue.length}
          description="Current unclaimed forge queue items."
        />

        <StatCard
          title="Ready To Claim"
          value={completedForgeCount}
          description="Finished forge timers."
        />

        <StatCard
          title="Memo Status"
          value={`${dailyProgress.current}/${dailyProgress.target}`}
          description={
            dailyProgress.current > dailyProgress.target
              ? "Memo progress is over the daily target."
              : "Current daily memo progress."
          }
        />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <ProgressCard
          title="Daily Progress"
          progress={dailyProgress}
          accent="amber"
        />

        <ProgressCard
          title="Weekly Progress"
          progress={weeklyProgress}
          accent="blue"
        />
      </section>

      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Forge Queue Preview</h2>
            <p className="mt-2 text-zinc-400">
              Latest active forge timers.
            </p>
          </div>

          <Link
            href="/forge-queue"
            className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-zinc-950 hover:bg-zinc-200"
          >
            Open Queue
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          {latestForgeItems.length === 0 && (
            <p className="text-zinc-400">No active forge timers.</p>
          )}

          {latestForgeItems.map((item) => {
            const remaining = getRemainingMs(item);
            const ready = remaining <= 0;

            return (
              <article
                key={item.id}
                className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-bold">
                      {item.itemName ?? "Unknown Item"}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.itemCategory ?? "Forge Item"} • Qty{" "}
                      {item.quantity ?? 1}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      ready
                        ? "bg-green-500/20 text-green-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {ready ? "Ready" : formatRemaining(remaining)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        <h2 className="text-3xl font-bold">Next Forge</h2>

        {!nextForge && (
          <p className="mt-5 text-zinc-400">No active forge timers.</p>
        )}

        {nextForge && (
          <div className="mt-5 rounded-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800">
            <h3 className="text-2xl font-bold">
              {nextForge.itemName ?? "Unknown Item"}
            </h3>

            <p className="mt-2 text-zinc-400">
              {nextForge.itemCategory ?? "Forge Item"} • Qty{" "}
              {nextForge.quantity ?? 1}
            </p>

            <p className="mt-4 text-4xl font-black text-amber-200">
              {formatRemaining(getRemainingMs(nextForge))}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
