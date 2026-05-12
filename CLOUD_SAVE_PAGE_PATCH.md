# Add Realtime Sync panel to Cloud Save page

Open:

```txt
src/app/cloud-save/page.tsx
```

Add import:

```tsx
import RealtimeSyncPanel from "@/components/RealtimeSyncPanel";
```

Then place this near the bottom of the page, after your Cloud Save section:

```tsx
<section className="mt-6">
  <RealtimeSyncPanel />
</section>
```

Recommended placement:

```tsx
<section className="mt-6">
  <RealtimeSyncPanel />
</section>

<section className="mt-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
  <h2 className="text-2xl font-bold">How to use</h2>
  ...
</section>
```
