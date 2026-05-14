# Forge Queue Server Push Integration

This lets forge-complete notifications arrive even when the PWA is closed.

## 1. Copy files

Copy the package files into your project.

## 2. Add import

Open:

```txt
src/app/forge-queue/page.tsx
```

Add:

```tsx
import {
  getForgeNotificationKey,
  scheduleClientNotification,
} from "@/lib/push/clientSchedule";
```

## 3. Schedule notification when starting forge

Find your `startForge()` function.

After you create `queueItem`, add this before or after `setQueue(...)`:

```tsx
const notifyAt = new Date(
  new Date(queueItem.startedAt).getTime() +
    queueItem.durationMinutes * 60 * 1000
).toISOString();

scheduleClientNotification({
  notificationKey: getForgeNotificationKey(queueItem.id),
  type: "forge-complete",
  title: "Forge Complete",
  body: `${queueItem.itemName} is ready to claim.`,
  url: "/forge-queue",
  notifyAt,
}).catch(() => {
  // Notification scheduling can fail if offline. Forge timer still works.
});
```

## 4. Result

When a forge is started:
- the finish time is saved to Supabase
- Vercel Cron checks every 5 minutes
- push notification sends even if mobile PWA is closed
