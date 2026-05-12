export type DashboardProgress = {
  current: number;
  target: number;
  percent: number;
};

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function safeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function readLocalStorageArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(key);

  if (!saved) return [];

  try {
    return safeArray<T>(JSON.parse(saved));
  } catch {
    return [];
  }
}

export function getDailyMemoProgress(tasks: unknown): DashboardProgress {
  const safeTasks = safeArray<Record<string, unknown>>(tasks);
  const target = 200;

  const current = safeTasks.reduce((total, task) => {
    const taskCurrent = safeNumber(task.current);
    const taskTarget = Math.max(safeNumber(task.target, 1), 1);
    const reward = safeNumber(task.reward);

    return taskCurrent >= taskTarget ? total + reward : total;
  }, 0);

  return {
    current,
    target,
    percent: Math.min(Math.round((current / target) * 100), 100),
  };
}

export function getWeeklyTrackerProgress(trackers: unknown): DashboardProgress {
  const safeTrackers = safeArray<Record<string, unknown>>(trackers);

  const current = safeTrackers.reduce(
    (total, tracker) => total + safeNumber(tracker.current),
    0
  );

  const target = safeTrackers.reduce(
    (total, tracker) => total + safeNumber(tracker.target),
    0
  );

  return {
    current,
    target,
    percent:
      target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
  };
}

export function getDashboardDailyProgressFromStorage() {
  return getDailyMemoProgress(readLocalStorageArray("dailyTasks"));
}

export function getDashboardWeeklyProgressFromStorage() {
  return getWeeklyTrackerProgress(readLocalStorageArray("weeklyTasks"));
}
