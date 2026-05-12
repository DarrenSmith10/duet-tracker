# Settings/Menu integration

Your Settings page should include links to:

```tsx
<MenuCard
  title="Cloud Save"
  description="Sync your tracker save across devices using Supabase."
  href="/cloud-save"
  icon="☁️"
/>

<MenuCard
  title="Notifications"
  description="Enable real PWA push notifications for this device."
  href="/notifications"
  icon="🔔"
/>
```

Also make sure `STORAGE_KEYS` includes:

```tsx
"forgeHistory",
"customForgeRecipes",
"recipeOverrides",
```

The package includes `src/lib/saveKeys.ts` which already knows about these keys.
