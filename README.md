# Realtime Supabase Sync

This package adds realtime sync for:

```txt
materials
forgeQueue
forgeHistory
dailyTasks
weeklyTasks
quickNotes
customForgeRecipes
recipeOverrides
```

## 1. Run SQL in Supabase

Open Supabase SQL Editor and run:

```txt
supabase/realtime-save-schema.sql
```

## 2. Copy files

```txt
src/lib/realtimeSaveKeys.ts
src/lib/supabase/realtimeSync.ts
src/hooks/useRealtimeSaveSync.ts
src/components/RealtimeSyncPanel.tsx
```

## 3. Add panel to Cloud Save page

Follow:

```txt
CLOUD_SAVE_PAGE_PATCH.md
```

## 4. Optional auto-upload

Follow:

```txt
AUTO_UPLOAD_PATCHES.md
```

## 5. Test

1. Sign in on `/cloud-save`.
2. Press `Upload Local`.
3. Open app on iPhone and sign in.
4. Press `Download Cloud`.
5. Press `Start Live Sync` on both devices.
6. Change materials on one device.
7. Reopen/refresh the other device and confirm data updated.

This version uses Supabase realtime records as the shared source.
# duet-tracker
