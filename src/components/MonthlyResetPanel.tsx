"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_MYSTIC_MAZE_CALCULATOR,
  DEFAULT_ROLLING_RESET_TRACKERS,
  MONTHLY_RESET_STORAGE_KEY,
  MYSTIC_MAZE_CALCULATOR_STORAGE_KEY,
  applyRollingAutoReset,
  calculateMysticMazeRuns,
  formatResetCountdown,
  getNowIso,
  getTrackerNextResetDate,
  type MysticMazeShopCalculator,
  type RollingResetTracker,
} from "@/lib/monthlyReset";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function loadTrackers() {
  if (typeof window === "undefined") return DEFAULT_ROLLING_RESET_TRACKERS;

  const saved = localStorage.getItem(MONTHLY_RESET_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_ROLLING_RESET_TRACKERS.map((tracker) => ({
      ...tracker,
      lastResetAt: getNowIso(),
    }));
  }

  try {
    const parsed = JSON.parse(saved) as Partial<RollingResetTracker>[];

    const merged = DEFAULT_ROLLING_RESET_TRACKERS.map((defaultTracker) => {
      const savedTracker = parsed.find((tracker) => tracker.id === defaultTracker.id);

      return {
        ...defaultTracker,
        ...savedTracker,
        intervalDays: savedTracker?.intervalDays ?? defaultTracker.intervalDays,
        lastResetAt: savedTracker?.lastResetAt || getNowIso(),
      };
    });

    const custom = parsed
      .filter((tracker) => !merged.some((defaultTracker) => defaultTracker.id === tracker.id))
      .map((tracker) => ({
        id: tracker.id ?? `custom-${Date.now()}`,
        title: tracker.title ?? "Custom Reset",
        description: tracker.description ?? "Custom rolling reset tracker.",
        completed: tracker.completed ?? false,
        intervalDays: tracker.intervalDays ?? 28,
        lastResetAt: tracker.lastResetAt || getNowIso(),
      }));

    return [...merged, ...custom];
  } catch {
    return DEFAULT_ROLLING_RESET_TRACKERS.map((tracker) => ({
      ...tracker,
      lastResetAt: getNowIso(),
    }));
  }
}

function loadCalculator() {
  if (typeof window === "undefined") return DEFAULT_MYSTIC_MAZE_CALCULATOR;

  const saved = localStorage.getItem(MYSTIC_MAZE_CALCULATOR_STORAGE_KEY);
  if (!saved) return DEFAULT_MYSTIC_MAZE_CALCULATOR;

  try {
    return {
      ...DEFAULT_MYSTIC_MAZE_CALCULATOR,
      ...JSON.parse(saved),
    } as MysticMazeShopCalculator;
  } catch {
    return DEFAULT_MYSTIC_MAZE_CALCULATOR;
  }
}

export default function MonthlyResetPanel() {
  const [trackers, setTrackers] = useState<RollingResetTracker[]>(
    DEFAULT_ROLLING_RESET_TRACKERS
  );
  const [calculator, setCalculator] = useState<MysticMazeShopCalculator>(
    DEFAULT_MYSTIC_MAZE_CALCULATOR
  );
  const [newTrackerTitle, setNewTrackerTitle] = useState("");
  const [newIntervalDays, setNewIntervalDays] = useState(28);

  useEffect(() => {
    const resetTrackers = applyRollingAutoReset(loadTrackers());
    setTrackers(resetTrackers);
    setCalculator(loadCalculator());
    localStorage.setItem(MONTHLY_RESET_STORAGE_KEY, JSON.stringify(resetTrackers));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTrackers((prev) => {
        const next = applyRollingAutoReset(prev);
        localStorage.setItem(MONTHLY_RESET_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(MONTHLY_RESET_STORAGE_KEY, JSON.stringify(trackers));
  }, [trackers]);

  useEffect(() => {
    localStorage.setItem(
      MYSTIC_MAZE_CALCULATOR_STORAGE_KEY,
      JSON.stringify(calculator)
    );
  }, [calculator]);

  const mazeCalculation = useMemo(
    () => calculateMysticMazeRuns(calculator),
    [calculator]
  );

  function updateTracker(id: string, completed: boolean) {
    setTrackers((prev) =>
      prev.map((tracker) =>
        tracker.id === id
          ? {
              ...tracker,
              completed,
            }
          : tracker
      )
    );
  }

  function resetTrackerNow(id: string) {
    setTrackers((prev) =>
      prev.map((tracker) =>
        tracker.id === id
          ? {
              ...tracker,
              completed: false,
              lastResetAt: getNowIso(),
            }
          : tracker
      )
    );
  }

  function resetAllNow() {
    const confirmed = window.confirm("Reset all rolling shop trackers now?");
    if (!confirmed) return;

    setTrackers((prev) =>
      prev.map((tracker) => ({
        ...tracker,
        completed: false,
        lastResetAt: getNowIso(),
      }))
    );
  }

  function addCustomTracker() {
    if (!newTrackerTitle.trim()) {
      alert("Please enter a tracker name.");
      return;
    }

    setTrackers((prev) => [
      ...prev,
      {
        id: `custom-rolling-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: newTrackerTitle.trim(),
        description: `Custom tracker. Resets every ${newIntervalDays} days.`,
        completed: false,
        intervalDays: Math.max(newIntervalDays, 1),
        lastResetAt: getNowIso(),
      },
    ]);

    setNewTrackerTitle("");
    setNewIntervalDays(28);
  }

  function deleteTracker(id: string) {
    const confirmed = window.confirm("Delete this reset tracker?");
    if (!confirmed) return;

    setTrackers((prev) => prev.filter((tracker) => tracker.id !== id));
  }

  function updateCalculatorField(
    field: keyof MysticMazeShopCalculator,
    value: number
  ) {
    setCalculator((prev) => ({
      ...prev,
      [field]: Math.max(Number.isFinite(value) ? value : 0, 0),
    }));
  }

  return (
    <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Rolling Shop Resets</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Mystic Maze, Fishing, and Immersive Theatre reset every 28 days. Geniemon resets every 3 days.
          </p>
        </div>

        <button
          type="button"
          onClick={resetAllNow}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
        >
          Reset All Now
        </button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {trackers.map((tracker) => {
          const countdown = formatResetCountdown(tracker);
          const nextReset = getTrackerNextResetDate(tracker);

          return (
            <article
              key={tracker.id}
              className={`rounded-2xl border p-4 ${
                tracker.completed
                  ? "border-green-400/30 bg-green-500/10"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{tracker.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Every {tracker.intervalDays} days
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    tracker.completed
                      ? "bg-green-500/20 text-green-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {tracker.completed ? "Done" : "Open"}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Time until reset</p>
                <p className="mt-1 text-2xl font-bold text-amber-200">
                  {countdown}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Next: {nextReset.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => updateTracker(tracker.id, !tracker.completed)}
                  className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
                >
                  {tracker.completed ? "Mark Open" : "Mark Done"}
                </button>

                
<div className="mt-4 grid gap-2">
  <button
    type="button"
    onClick={() => updateTracker(tracker.id, !tracker.completed)}
    className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
  >
    {tracker.completed ? "Mark Open" : "Mark Done"}
  </button>

  <button
    type="button"
    onClick={() => resetTrackerNow(tracker.id)}
    className="rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-white hover:bg-zinc-700"
  >
    Start Timer Now
  </button>

  {/* NEW MANUAL DATE EDITOR */}
  <input
    type="datetime-local"
    value={
      tracker.lastResetAt
        ? new Date(tracker.lastResetAt)
            .toISOString()
            .slice(0, 16)
        : ""
    }
    onChange={(event) => {
      const newDate = new Date(event.target.value);

      if (Number.isNaN(newDate.getTime())) return;

      setTrackers((prev) =>
        prev.map((item) =>
          item.id === tracker.id
            ? {
                ...item,
                lastResetAt: newDate.toISOString(),
              }
            : item
        )
      );
    }}
    className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
  />

  <p className="text-xs text-zinc-500">
    Manually adjust reset start date/time.
  </p>

  {tracker.id.startsWith("custom-rolling-") && (
    <button
      type="button"
      onClick={() => deleteTracker(tracker.id)}
      className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-400"
    >
      Delete
    </button>
  )}
</div>

                {tracker.id.startsWith("custom-rolling-") && (
                  <button
                    type="button"
                    onClick={() => deleteTracker(tracker.id)}
                    className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mb-6 rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
        <h3 className="text-xl font-bold">Add Custom Rolling Reset</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input
            value={newTrackerTitle}
            onChange={(event) => setNewTrackerTitle(event.target.value)}
            placeholder="Example: Event Shop"
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <input
            type="number"
            min="1"
            value={newIntervalDays}
            onChange={(event) => setNewIntervalDays(Number(event.target.value))}
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <button
            type="button"
            onClick={addCustomTracker}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            Add Tracker
          </button>
        </div>

        <p className="mt-2 text-xs text-zinc-500">Name • Interval days • Add</p>
      </div>

      <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-amber-400/20">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-amber-100">
            Mystic Maze Shop Calculator
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Calculates how many runs you need to empty the shop based on Threads of Time.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Current Threads of Time
            </label>
            <input
              type="number"
              min="0"
              value={calculator.currentThreads}
              onChange={(event) =>
                updateCalculatorField("currentThreads", Number(event.target.value))
              }
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Total Shop Cost
            </label>
            <input
              type="number"
              min="0"
              value={calculator.totalShopCost}
              onChange={(event) =>
                updateCalculatorField("totalShopCost", Number(event.target.value))
              }
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Threads Per Run
            </label>
            <input
              type="number"
              min="0"
              value={calculator.threadsPerRun}
              onChange={(event) =>
                updateCalculatorField("threadsPerRun", Number(event.target.value))
              }
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">Threads Still Needed</p>
            <p className="mt-2 text-3xl font-bold">
              {formatNumber(mazeCalculation.remainingThreads)}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">Runs Needed</p>
            <p className="mt-2 text-3xl font-bold text-amber-200">
              {mazeCalculation.canCalculate
                ? formatNumber(mazeCalculation.runsNeeded)
                : "Enter threads/run"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
