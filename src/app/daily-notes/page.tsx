"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_DAILY_ACTIVITY_TASKS,
  DEFAULT_WEEKLY_ACTIVITY_TRACKERS,
  type DailyActivityTask,
  type WeeklyActivityTracker,
} from "@/lib/dailyActivity";

import MonthlyResetPanel from "@/components/MonthlyResetPanel";

import ResetNotificationWatcher from "@/components/ResetNotificationWatcher";

import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";

const DAILY_STORAGE_KEY = "dailyTasks";
const WEEKLY_STORAGE_KEY = "weeklyTasks";
const MEMO_TARGET = 200;

function clamp(value: number, min: number, max?: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (max === undefined) return Math.max(safeValue, min);
  return Math.min(Math.max(safeValue, min), max);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function mergeDailyTasks(savedTasks: DailyActivityTask[]) {
  const mergedDefaults = DEFAULT_DAILY_ACTIVITY_TASKS.map((defaultTask) => {
    const savedTask = savedTasks.find((task) => task.id === defaultTask.id);

    return savedTask
      ? {
          ...defaultTask,
          ...savedTask,
          current: clamp(savedTask.current, 0),
          target: clamp(savedTask.target, 1),
          reward: clamp(savedTask.reward, 0),
        }
      : defaultTask;
  });

  const customTasks = savedTasks.filter(
    (savedTask) =>
      !mergedDefaults.some((defaultTask) => defaultTask.id === savedTask.id)
  );

  return [...mergedDefaults, ...customTasks];
}

function mergeWeeklyTrackers(savedTrackers: WeeklyActivityTracker[]) {
  const mergedDefaults = DEFAULT_WEEKLY_ACTIVITY_TRACKERS.map((defaultTracker) => {
    const savedTracker = savedTrackers.find(
      (tracker) => tracker.id === defaultTracker.id
    );

    return savedTracker
      ? {
          ...defaultTracker,
          ...savedTracker,
          current: clamp(savedTracker.current, 0),
          target: clamp(savedTracker.target, 1),
        }
      : defaultTracker;
  });

  const customTrackers = savedTrackers.filter(
    (savedTracker) =>
      !mergedDefaults.some(
        (defaultTracker) => defaultTracker.id === savedTracker.id
      )
  );

  return [...mergedDefaults, ...customTrackers];
}

function ProgressBar({
  current,
  target,
  compact = false,
}: {
  current: number;
  target: number;
  compact?: boolean;
}) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className={`overflow-hidden rounded-full bg-zinc-800 ${compact ? "h-2" : "h-4"}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-100 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function DailyTaskCard({
  task,
  onChange,
  onClaimMax,
}: {
  task: DailyActivityTask;
  onChange: (current: number) => void;
  onClaimMax: () => void;
}) {
  const complete = task.current >= task.target;

  return (
    <article
      className={`rounded-2xl border p-4 shadow-lg transition ${
        complete
          ? "border-amber-400/40 bg-amber-500/10"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_110px_120px] md:items-center">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>

            <span className="rounded-lg bg-zinc-950 px-3 py-1 text-sm font-bold text-amber-200 ring-1 ring-amber-400/20 md:hidden">
              +{task.reward}
            </span>
          </div>

          <div className="mt-3">
            <ProgressBar current={task.current} target={task.target} compact />
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            {formatNumber(task.current)} / {formatNumber(task.target)}
          </p>
        </div>

        <div className="hidden text-center md:block">
          <p className="text-sm text-zinc-500">Reward</p>
          <p className="mt-1 text-2xl font-bold text-amber-200">
            +{formatNumber(task.reward)}
          </p>
        </div>

        <div className="flex gap-2 md:justify-end">
          <input
            type="number"
            min="0"
            value={task.current}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-24 rounded-xl bg-zinc-950 p-3 text-center text-white outline-none ring-1 ring-zinc-800 focus:ring-amber-300"
          />

          <button
            type="button"
            onClick={onClaimMax}
            className={`rounded-xl px-4 py-3 font-semibold ${
              complete
                ? "bg-amber-200 text-zinc-950 hover:bg-amber-100"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            {complete ? "Done" : "Claim"}
          </button>
        </div>
      </div>
    </article>
  );
}

function WeeklyTrackerCard({
  tracker,
  onChange,
  onMax,
}: {
  tracker: WeeklyActivityTracker;
  onChange: (current: number) => void;
  onMax: () => void;
}) {
  const complete = tracker.current >= tracker.target;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{tracker.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {formatNumber(tracker.current)} / {formatNumber(tracker.target)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            complete
              ? "bg-green-500/20 text-green-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {complete ? "Complete" : "In Progress"}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar current={tracker.current} target={tracker.target} compact />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="number"
          min="0"
          value={tracker.current}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-24 rounded-xl bg-zinc-950 p-3 text-center text-white outline-none ring-1 ring-zinc-800 focus:ring-amber-300"
        />

        <button
          type="button"
          onClick={onMax}
          className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-white hover:bg-zinc-700"
        >
          Set Complete
        </button>
      </div>
    </article>
  );
}

export default function DailyNotesPage() {
  const [dailyTasks, setDailyTasks] = useState<DailyActivityTask[]>(
    DEFAULT_DAILY_ACTIVITY_TASKS
  );
  const [weeklyTrackers, setWeeklyTrackers] = useState<WeeklyActivityTracker[]>(
    DEFAULT_WEEKLY_ACTIVITY_TRACKERS
  );
  const [newDailyTitle, setNewDailyTitle] = useState("");
  const [newDailyTarget, setNewDailyTarget] = useState(1);
  const [newDailyReward, setNewDailyReward] = useState(40);

  useEffect(() => {
    const savedDaily = localStorage.getItem(DAILY_STORAGE_KEY);
    const savedWeekly = localStorage.getItem(WEEKLY_STORAGE_KEY);

    if (savedDaily) {
      try {
        setDailyTasks(mergeDailyTasks(JSON.parse(savedDaily)));
      } catch {
        setDailyTasks(DEFAULT_DAILY_ACTIVITY_TASKS);
      }
    }

    if (savedWeekly) {
      try {
        setWeeklyTrackers(mergeWeeklyTrackers(JSON.parse(savedWeekly)));
      } catch {
        setWeeklyTrackers(DEFAULT_WEEKLY_ACTIVITY_TRACKERS);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyTasks));

    pushSaveKeyToSupabase("dailyTasks").catch(() => {
      // user may not be signed in
    });
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(weeklyTrackers));

    pushSaveKeyToSupabase("weeklyTasks").catch(() => {
      // user may not be signed in
    });
  }, [weeklyTrackers]);

  useEffect(() => {
    const refreshFromRealtime = () => {
      const savedDaily = localStorage.getItem(DAILY_STORAGE_KEY);
      const savedWeekly = localStorage.getItem(WEEKLY_STORAGE_KEY);

      if (savedDaily) {
        try {
          setDailyTasks(mergeDailyTasks(JSON.parse(savedDaily)));
        } catch {}
      }

      if (savedWeekly) {
        try {
          setWeeklyTrackers(mergeWeeklyTrackers(JSON.parse(savedWeekly)));
        } catch {}
      }
    };

    window.addEventListener("dna-realtime-save-updated", refreshFromRealtime);
    window.addEventListener("focus", refreshFromRealtime);

    return () => {
      window.removeEventListener("dna-realtime-save-updated", refreshFromRealtime);
      window.removeEventListener("focus", refreshFromRealtime);
    };
  }, []);

  const memoProgress = useMemo(
    () =>
      dailyTasks.reduce((total, task) => {
        return task.current >= task.target ? total + task.reward : total;
      }, 0),
    [dailyTasks]
  );

  const completedDailyCount = dailyTasks.filter(
    (task) => task.current >= task.target
  ).length;

  const completedWeeklyCount = weeklyTrackers.filter(
    (tracker) => tracker.current >= tracker.target
  ).length;

  function updateDailyTask(id: string, current: number) {
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              current: clamp(current, 0),
            }
          : task
      )
    );
  }

  function updateWeeklyTracker(id: string, current: number) {
    setWeeklyTrackers((prev) =>
      prev.map((tracker) =>
        tracker.id === id
          ? {
              ...tracker,
              current: clamp(current, 0),
            }
          : tracker
      )
    );
  }

  function resetDailyTasks() {
    const confirmed = window.confirm("Reset all daily activity progress?");
    if (!confirmed) return;

    setDailyTasks((prev) =>
      prev.map((task) => ({
        ...task,
        current: 0,
      }))
    );
  }

  function resetWeeklyTrackers() {
    const confirmed = window.confirm("Reset all weekly tracker progress?");
    if (!confirmed) return;

    setWeeklyTrackers((prev) =>
      prev.map((tracker) => ({
        ...tracker,
        current: 0,
      }))
    );
  }

  function addDailyTask() {
    if (!newDailyTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    setDailyTasks((prev) => [
      ...prev,
      {
        id: `custom-daily-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: newDailyTitle.trim(),
        current: 0,
        target: clamp(newDailyTarget, 1),
        reward: clamp(newDailyReward, 0),
      },
    ]);

    setNewDailyTitle("");
    setNewDailyTarget(1);
    setNewDailyReward(40);
  }

  function deleteDailyTask(id: string) {
    const confirmed = window.confirm("Delete this daily task?");
    if (!confirmed) return;

    setDailyTasks((prev) => prev.filter((task) => task.id !== id));
  }

  const memoPercent = Math.min((memoProgress / MEMO_TARGET) * 100, 100);
  const overCap = memoProgress > MEMO_TARGET;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Daily Notes</h1>
        <p className="mt-2 text-zinc-400">
          Memo progress, daily activity rewards, and weekly trackers.
        </p>
      </div>
      <section className="mb-6">
  <ResetNotificationWatcher />
</section>


      <section className="mb-6 overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">
              Memo Progress
            </p>

            <h2 className="mt-2 text-5xl font-black">
              {formatNumber(memoProgress)}
              <span className="text-2xl text-zinc-500"> / {MEMO_TARGET}</span>
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {overCap
                ? `Over cap by ${formatNumber(memoProgress - MEMO_TARGET)} memo.`
                : `${formatNumber(MEMO_TARGET - memoProgress)} memo remaining.`}
            </p>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900/80 p-4 ring-1 ring-zinc-800">
              <p className="text-zinc-400">Daily Complete</p>
              <p className="mt-1 text-2xl font-bold">
                {completedDailyCount} / {dailyTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900/80 p-4 ring-1 ring-zinc-800">
              <p className="text-zinc-400">Weekly Complete</p>
              <p className="mt-1 text-2xl font-bold">
                {completedWeeklyCount} / {weeklyTrackers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar current={memoProgress} target={MEMO_TARGET} />
        </div>

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>0</span>
          <span>{Math.round(memoPercent)}%</span>
          <span>{MEMO_TARGET}</span>
        </div>
      </section>

      <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Daily Activity</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Complete activities to earn memo points. The total can go above 200.
            </p>
          </div>

          <button
            type="button"
            onClick={resetDailyTasks}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
          >
            Reset Daily
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {dailyTasks.map((task) => (
            <div key={task.id} className="relative">
              <DailyTaskCard
                task={task}
                onChange={(current) => updateDailyTask(task.id, current)}
                onClaimMax={() => updateDailyTask(task.id, task.target)}
              />

              {task.id.startsWith("custom-daily-") && (
                <button
                  type="button"
                  onClick={() => deleteDailyTask(task.id)}
                  className="absolute right-3 top-3 rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">Add Custom Daily Task</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_130px_130px_auto]">
          <input
            value={newDailyTitle}
            onChange={(event) => setNewDailyTitle(event.target.value)}
            placeholder="Task title"
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <input
            type="number"
            min="1"
            value={newDailyTarget}
            onChange={(event) => setNewDailyTarget(Number(event.target.value))}
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <input
            type="number"
            min="0"
            value={newDailyReward}
            onChange={(event) => setNewDailyReward(Number(event.target.value))}
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <button
            type="button"
            onClick={addDailyTask}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            Add Task
          </button>
        </div>

        <div className="mt-2 grid gap-3 text-xs text-zinc-500 md:grid-cols-[1fr_130px_130px_auto]">
          <span>Name</span>
          <span>Target</span>
          <span>Memo Reward</span>
          <span />
        </div>
      </section>

      <section className="mb-6">
       <MonthlyResetPanel />
      </section>
      <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Weekly Trackers</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Track weekly progress separately from memo points.
            </p>
          </div>

          <button
            type="button"
            onClick={resetWeeklyTrackers}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
          >
            Reset Weekly
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {weeklyTrackers.map((tracker) => (
            <WeeklyTrackerCard
              key={tracker.id}
              tracker={tracker}
              onChange={(current) => updateWeeklyTracker(tracker.id, current)}
              onMax={() => updateWeeklyTracker(tracker.id, tracker.target)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
