export type ResetNotificationItem = {
  id: string;
  title: string;
  body: string;
  resetKey: string;
  ready: boolean;
};

const RESET_NOTIFICATION_STORAGE_KEY = "resetNotificationHistory";

function getTodayKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function getWeekKey() {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor(
    (now.getTime() - firstDayOfYear.getTime()) / 86400000
  );
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${weekNumber}`;
}

function readNotificationHistory() {
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem(RESET_NOTIFICATION_STORAGE_KEY);

  if (!saved) return {};

  try {
    return JSON.parse(saved) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveNotificationHistory(history: Record<string, string>) {
  localStorage.setItem(RESET_NOTIFICATION_STORAGE_KEY, JSON.stringify(history));
}

export async function requestResetNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
}

export function showResetNotification(title: string, body: string, url = "/daily-notes") {
  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: title,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = url;
  };
}

export function notifyOncePerReset(item: ResetNotificationItem) {
  if (!item.ready) return false;

  const history = readNotificationHistory();
  const alreadySent = history[item.id] === item.resetKey;

  if (alreadySent) return false;

  showResetNotification(item.title, item.body);

  history[item.id] = item.resetKey;
  saveNotificationHistory(history);

  return true;
}

export function buildDailyResetNotification(): ResetNotificationItem {
  return {
    id: "daily-reset",
    title: "Daily Reset Ready",
    body: "Your daily tasks and memo progress are ready to reset.",
    resetKey: getTodayKey(),
    ready: true,
  };
}

export function buildWeeklyResetNotification(): ResetNotificationItem {
  return {
    id: "weekly-reset",
    title: "Weekly Reset Ready",
    body: "Your weekly trackers are ready to reset.",
    resetKey: getWeekKey(),
    ready: true,
  };
}

export function buildRollingResetNotification({
  id,
  title,
  nextResetAt,
}: {
  id: string;
  title: string;
  nextResetAt: Date;
}): ResetNotificationItem {
  const now = new Date();
  const ready = nextResetAt.getTime() <= now.getTime();

  return {
    id: `rolling-${id}`,
    title: `${title} Reset Ready`,
    body: `${title} has reset. Check the shop/event now.`,
    resetKey: nextResetAt.toISOString(),
    ready,
  };
}
