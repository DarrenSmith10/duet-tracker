export type RollingResetTracker = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  intervalDays: number;
  lastResetAt: string;
};

export type MysticMazeShopCalculator = {
  currentThreads: number;
  totalShopCost: number;
  threadsPerRun: number;
};

export const MONTHLY_RESET_STORAGE_KEY = "monthlyResetTrackers";
export const MYSTIC_MAZE_CALCULATOR_STORAGE_KEY = "mysticMazeShopCalculator";

export const DEFAULT_ROLLING_RESET_TRACKERS: RollingResetTracker[] = [
  {
    id: "mystic-maze-shop",
    title: "Mystic Maze Shop",
    description: "Mystic Maze shop reset tracker. Resets every 28 days.",
    completed: false,
    intervalDays: 28,
    lastResetAt: "",
  },
  {
    id: "fishing-shop",
    title: "Fishing Shop",
    description: "Fishing shop reset tracker. Resets every 28 days.",
    completed: false,
    intervalDays: 28,
    lastResetAt: "",
  },
  {
    id: "immersive-theatre",
    title: "Immersive Theatre",
    description: "Immersive Theatre reset tracker. Resets every 28 days.",
    completed: false,
    intervalDays: 28,
    lastResetAt: "",
  },
  {
    id: "geniemon",
    title: "Geniemon",
    description: "Geniemon reset tracker. Resets every 3 days.",
    completed: false,
    intervalDays: 3,
    lastResetAt: "",
  },
];

export const DEFAULT_MYSTIC_MAZE_CALCULATOR: MysticMazeShopCalculator = {
  currentThreads: 0,
  totalShopCost: 0,
  threadsPerRun: 0,
};

export function getNowIso() {
  return new Date().toISOString();
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getTrackerLastResetDate(tracker: RollingResetTracker) {
  if (!tracker.lastResetAt) return new Date();

  const parsed = new Date(tracker.lastResetAt);

  if (Number.isNaN(parsed.getTime())) return new Date();

  return parsed;
}

export function getTrackerNextResetDate(tracker: RollingResetTracker) {
  const lastReset = getTrackerLastResetDate(tracker);
  return addDays(lastReset, tracker.intervalDays);
}

export function getTimeUntilReset(tracker: RollingResetTracker, now = new Date()) {
  const nextReset = getTrackerNextResetDate(tracker);
  const differenceMs = Math.max(nextReset.getTime() - now.getTime(), 0);

  const totalHours = Math.floor(differenceMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = Math.floor((differenceMs / (1000 * 60)) % 60);

  return {
    differenceMs,
    days,
    hours,
    minutes,
    isReady: differenceMs <= 0,
  };
}

export function formatResetCountdown(tracker: RollingResetTracker) {
  const remaining = getTimeUntilReset(tracker);

  if (remaining.isReady) return "Ready to reset";

  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`;
  }

  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }

  return `${remaining.minutes}m`;
}

export function applyRollingAutoReset(trackers: RollingResetTracker[]) {
  const now = new Date();

  return trackers.map((tracker) => {
    const lastResetAt = tracker.lastResetAt || now.toISOString();
    const nextTracker = {
      ...tracker,
      lastResetAt,
    };

    const remaining = getTimeUntilReset(nextTracker, now);

    if (!remaining.isReady) return nextTracker;

    return {
      ...nextTracker,
      completed: false,
      lastResetAt: now.toISOString(),
    };
  });
}

export function calculateMysticMazeRuns({
  currentThreads,
  totalShopCost,
  threadsPerRun,
}: MysticMazeShopCalculator) {
  const remainingThreads = Math.max(totalShopCost - currentThreads, 0);

  if (remainingThreads <= 0) {
    return {
      remainingThreads: 0,
      runsNeeded: 0,
      canCalculate: true,
    };
  }

  if (threadsPerRun <= 0) {
    return {
      remainingThreads,
      runsNeeded: 0,
      canCalculate: false,
    };
  }

  return {
    remainingThreads,
    runsNeeded: Math.ceil(remainingThreads / threadsPerRun),
    canCalculate: true,
  };
}
