# Server Scheduled Push Notifications

This package adds background push notifications that work when the mobile PWA is closed.

## What it adds

```txt
Supabase scheduled_notifications table
Vercel Cron every 5 minutes
/api/cron/send-notifications
/api/notifications/schedule
push scheduler helpers
forge queue integration guide
reset tracker integration guide
```

## 1. Run Supabase SQL

Open Supabase SQL Editor and run:

```txt
supabase/scheduled-notifications-schema.sql
```

## 2. Copy files

Copy:

```txt
src/lib/push/sendPush.ts
src/lib/push/scheduler.ts
src/lib/push/clientSchedule.ts
src/app/api/cron/send-notifications/route.ts
src/app/api/notifications/schedule/route.ts
vercel.json
```

If you already have `vercel.json`, merge the `crons` section instead of replacing it.

## 3. Environment variables

Make sure these exist locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT_EMAIL=
CRON_SECRET=
```

`CRON_SECRET` is optional in this package. If you add it, external callers need:

```txt
Authorization: Bearer YOUR_SECRET
```

Vercel Cron normally calls your route automatically.

## 4. Install packages

```bash
npm install web-push
npm install -D @types/web-push
```

## 5. Add integrations

For forge notifications:

```txt
FORGE_QUEUE_INTEGRATION.md
```

For reset notifications:

```txt
RESET_TRACKER_INTEGRATION.md
```

## 6. Deploy

```bash
npm run build
vercel --prod
```

## 7. Test cron manually

Open in browser:

```txt
https://YOUR-APP.vercel.app/api/cron/send-notifications
```

If using `CRON_SECRET`, test with curl:

```bash
curl -H "Authorization: Bearer YOUR_SECRET" https://YOUR-APP.vercel.app/api/cron/send-notifications
```

## Important

Vercel Cron only runs on deployed Vercel projects, not normal localhost dev.
