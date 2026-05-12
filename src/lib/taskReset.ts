export function shouldResetDaily(lastReset: string | null) {
  if (!lastReset) return true;

  const last = new Date(lastReset);
  const now = new Date();

  return (
    last.getDate() !== now.getDate() ||
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
}

export function shouldResetWeekly(lastReset: string | null) {
  if (!lastReset) return true;

  const last = new Date(lastReset);
  const now = new Date();

  const lastWeekStart = new Date(last);
  lastWeekStart.setDate(last.getDate() - last.getDay());

  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());

  return (
    lastWeekStart.toDateString() !==
    currentWeekStart.toDateString()
  );
}