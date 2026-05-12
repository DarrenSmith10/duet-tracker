# Forge Queue changes already supported by this package

This package replaces the materials inventory helpers so Forge Queue can correctly read the `materials` localStorage key used by the Materials page.

## If Forge Queue still imports default materials directly

Replace:

```tsx
import { materials as defaultMaterials } from "@/data/materials";
```

and this state:

```tsx
const [materialsInventory, setMaterialsInventory] =
  useState<MaterialInventoryItem[]>(defaultMaterials);
```

with:

```tsx
import { loadMaterialsInventory } from "@/lib/materialInventory";

const [materialsInventory, setMaterialsInventory] =
  useState<MaterialInventoryItem[]>([]);
```

Then replace your saved materials loading effect with:

```tsx
useEffect(() => {
  setMaterialsInventory(loadMaterialsInventory());
}, []);
```

## To refresh inventory after returning from Materials page

You can also add:

```tsx
useEffect(() => {
  const refresh = () => setMaterialsInventory(loadMaterialsInventory());

  window.addEventListener("focus", refresh);

  return () => window.removeEventListener("focus", refresh);
}, []);
```

## Forge complete push

Find this block:

```tsx
finishedUnnotified.forEach((item) => {
  sendForgeCompleteNotification(item.itemName);
});
```

Replace with:

```tsx
finishedUnnotified.forEach((item) => {
  sendForgeCompleteNotification(item.itemName);

  fetch("/api/push/send-forge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Forge Complete",
      body: `${item.itemName} is ready to claim.`,
      url: "/forge-queue",
    }),
  }).catch(() => {
    // Keep local notification working even if server push fails.
  });
});
```
