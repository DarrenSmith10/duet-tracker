export const DAILY_TASKS_KEY = "dailyTasks";
export const WEEKLY_TASKS_KEY = "weeklyTasks";
export const DAILY_RESET_META_KEY = "dailyResetMeta";
export const WEEKLY_RESET_META_KEY = "weeklyResetMeta";

export type ResetMeta = {
  lastResetKey: string;
};

export function getTodayResetKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function getWeekResetKey(date = new Date()) {
  const copied = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = copied.getUTCDay() || 7;
  copied.setUTCDate(copied.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(copied.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((copied.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${copied.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function resetProgressArray<T extends { current?: number }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    current: 0,
  }));
}

export function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("dna-realtime-save-updated"));
}

export function readResetMeta(key: string): ResetMeta | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    return JSON.parse(saved) as ResetMeta;
  } catch {
    return null;
  }
}

export function writeResetMeta(key: string, value: ResetMeta) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function resetDailyTasksNow() {
  const dailyTasks = readArray<{ current?: number }>(DAILY_TASKS_KEY);
  const resetDailyTasks = resetProgressArray(dailyTasks);

  writeArray(DAILY_TASKS_KEY, resetDailyTasks);
  writeResetMeta(DAILY_RESET_META_KEY, {
    lastResetKey: getTodayResetKey(),
  });

  return resetDailyTasks;
}

export function resetWeeklyTasksNow() {
  const weeklyTasks = readArray<{ current?: number }>(WEEKLY_TASKS_KEY);
  const resetWeeklyTasks = resetProgressArray(weeklyTasks);

  writeArray(WEEKLY_TASKS_KEY, resetWeeklyTasks);
  writeResetMeta(WEEKLY_RESET_META_KEY, {
    lastResetKey: getWeekResetKey(),
  });

  return resetWeeklyTasks;
}

export function autoResetDailyIfNeeded() {
  const todayKey = getTodayResetKey();
  const meta = readResetMeta(DAILY_RESET_META_KEY);

  if (meta?.lastResetKey === todayKey) {
    return false;
  }

  resetDailyTasksNow();
  return true;
}

export function autoResetWeeklyIfNeeded() {
  const weekKey = getWeekResetKey();
  const meta = readResetMeta(WEEKLY_RESET_META_KEY);

  if (meta?.lastResetKey === weekKey) {
    return false;
  }

  resetWeeklyTasksNow();
  return true;
}

export function getNextDailyResetIso() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(5, 0, 0, 0);
  return next.toISOString();
}

export function getNextWeeklyResetIso() {
  const now = new Date();
  const next = new Date(now);
  const day = next.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(5, 0, 0, 0);
  return next.toISOString();
}
