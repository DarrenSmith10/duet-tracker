# Auto Realtime Sync Layout Patch

Copy these files:

```txt
src/lib/realtimeSaveKeys.ts
src/lib/supabase/realtimeSync.ts
src/components/AutoRealtimeSync.tsx
```

Then open:

```txt
src/app/layout.tsx
```

Add this import:

```tsx
import AutoRealtimeSync from "@/components/AutoRealtimeSync";
```

Then inside `<body>`, add:

```tsx
<AutoRealtimeSync />
```

Example:

```tsx
<body>
  <AutoRealtimeSync />
  {children}
</body>
```

If your layout already has sidebar/mobile nav, keep them. Just place `<AutoRealtimeSync />` once near the top of body.

## Test

1. Sign in on PC through `/cloud-save`.
2. Sign in on iPhone through `/cloud-save`.
3. Open the app on both.
4. Change Materials or Daily Notes on PC.
5. Wait 1–3 seconds.
6. On mobile, change page or refresh.

The sync listens to localStorage changes and uploads:

```txt
materials
forgeQueue
forgeHistory
dailyTasks
weeklyTasks
quickNotes
customForgeRecipes
recipeOverrides
monthlyResetTrackers
mysticMazeShopCalculator
```
