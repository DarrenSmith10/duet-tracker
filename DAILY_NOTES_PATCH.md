# Add Reset Notifications to Daily Notes

Copy these files:

```txt
src/lib/resetNotifications.ts
src/components/ResetNotificationWatcher.tsx
```

Open:

```txt
src/app/daily-notes/page.tsx
```

Add import:

```tsx
import ResetNotificationWatcher from "@/components/ResetNotificationWatcher";
```

Add this near the top of the page, recommended after the title section:

```tsx
<section className="mb-6">
  <ResetNotificationWatcher />
</section>
```

## What it notifies

- Daily reset
- Weekly reset
- Mystic Maze Shop reset
- Fishing Shop reset
- Immersive Theatre reset
- Geniemon reset

## Important

This uses browser/PWA notifications while the app has been opened and the service worker/browser allows notifications.

For iPhone:
- install app to Home Screen
- open from Home Screen
- allow notifications
