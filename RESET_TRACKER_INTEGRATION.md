# Reset Tracker Server Push Integration

This lets Mystic Maze / Fishing / Immersive Theatre / Geniemon reset notifications arrive when the app is closed.

## 1. Add import

Open:

```txt
src/components/MonthlyResetPanel.tsx
```

Add:

```tsx
import {
  getResetNotificationKey,
  scheduleClientNotification,
} from "@/lib/push/clientSchedule";
```

## 2. Schedule notification after resetting tracker timer

Find `resetTrackerNow(id: string)`.

Inside the map where you update the tracker, calculate next reset:

```tsx
const nextResetAt = new Date();
nextResetAt.setDate(nextResetAt.getDate() + tracker.intervalDays);
```

Then after state update, schedule:

```tsx
const tracker = trackers.find((item) => item.id === id);

if (tracker) {
  const nextResetAt = new Date();
  nextResetAt.setDate(nextResetAt.getDate() + tracker.intervalDays);

  scheduleClientNotification({
    notificationKey: getResetNotificationKey(tracker.id, nextResetAt.toISOString()),
    type: "reset",
    title: `${tracker.title} Reset`,
    body: `${tracker.title} is ready again.`,
    url: "/daily-notes",
    notifyAt: nextResetAt.toISOString(),
  }).catch(() => {});
}
```

## Simple version

Add this at the end of `resetTrackerNow(id: string)`:

```tsx
const tracker = trackers.find((item) => item.id === id);

if (tracker) {
  const nextResetAt = new Date();
  nextResetAt.setDate(nextResetAt.getDate() + tracker.intervalDays);

  scheduleClientNotification({
    notificationKey: getResetNotificationKey(tracker.id, nextResetAt.toISOString()),
    type: "reset",
    title: `${tracker.title} Reset`,
    body: `${tracker.title} is ready again.`,
    url: "/daily-notes",
    notifyAt: nextResetAt.toISOString(),
  }).catch(() => {});
}
```
