# Optional auto-upload patches

These make pages push changes to Supabase whenever local data changes.

## Materials page

Open:

```txt
src/app/materials/page.tsx
```

Add:

```tsx
import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";
```

In your existing save effect:

```tsx
useEffect(() => {
  if (materials.length > 0) {
    saveMaterialsInventory(materials);
  }
}, [materials]);
```

Change to:

```tsx
useEffect(() => {
  if (materials.length > 0) {
    saveMaterialsInventory(materials);

    pushSaveKeyToSupabase("materials").catch(() => {
      // user may not be signed in
    });
  }
}, [materials]);
```

## Forge Queue page

Add:

```tsx
import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";
```

In your queue save effect:

```tsx
useEffect(() => {
  localStorage.setItem("forgeQueue", JSON.stringify(queue));
}, [queue]);
```

Change to:

```tsx
useEffect(() => {
  localStorage.setItem("forgeQueue", JSON.stringify(queue));

  pushSaveKeyToSupabase("forgeQueue").catch(() => {
    // user may not be signed in
  });
}, [queue]);
```

For forge history, after saving/adding history:

```tsx
pushSaveKeyToSupabase("forgeHistory").catch(() => {});
```

For custom recipes, after adding/editing/deleting:

```tsx
pushSaveKeyToSupabase("customForgeRecipes").catch(() => {});
```
