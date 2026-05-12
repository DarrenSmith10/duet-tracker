# Auto Material Deduction + Forge History Integration

This package includes:

```txt
src/lib/forgeHistory.ts
src/lib/inventoryActions.ts
src/components/ForgeHistoryAnalytics.tsx
```

It also includes the exact changes to apply to:

```txt
src/app/forge-queue/page.tsx
```

---

## 1. Add imports

At the top of `src/app/forge-queue/page.tsx`, add:

```tsx
import ForgeHistoryAnalytics from "@/components/ForgeHistoryAnalytics";

import {
  addForgeHistoryItem,
  clearForgeHistory,
  loadForgeHistory,
  type ForgeHistoryItem,
} from "@/lib/forgeHistory";

import { deductMaterialsFromInventory } from "@/lib/inventoryActions";
```

You should already have:

```tsx
import { materials as defaultMaterials } from "@/data/materials";
import type { MaterialInventoryItem } from "@/lib/types";
```

from the Inventory Cost Checker update.

---

## 2. Add state inside `ForgeQueuePage()`

Add this near your other `useState` lines:

```tsx
const [autoDeductMaterials, setAutoDeductMaterials] = useState(true);
const [forgeHistory, setForgeHistory] = useState<ForgeHistoryItem[]>([]);
```

---

## 3. Load forge history

Add this `useEffect` inside `ForgeQueuePage()`:

```tsx
useEffect(() => {
  setForgeHistory(loadForgeHistory());
}, []);
```

---

## 4. Add this helper inside `ForgeQueuePage()`

Place this near your other functions:

```tsx
function getQueueItemMaterials(item: ForgeQueueItem) {
  const recipe = queueRecipes.find((entry) => entry.id === item.itemId);

  if (!recipe) return [];

  return getTotalMaterials(recipe.materials, item.quantity);
}
```

---

## 5. Replace your `markClaimed` function

Replace your current:

```tsx
function markClaimed(id: string) {
  setQueue((prev) =>
    prev.map((item) => (item.id === id ? { ...item, claimed: true } : item))
  );
}
```

with this:

```tsx
function markClaimed(id: string) {
  const itemToClaim = queue.find((item) => item.id === id);

  if (!itemToClaim) return;

  const materialsUsed = getQueueItemMaterials(itemToClaim);

  if (autoDeductMaterials && materialsUsed.length > 0) {
    const nextInventory = deductMaterialsFromInventory(
      materialsInventory,
      materialsUsed
    );

    setMaterialsInventory(nextInventory);
    localStorage.setItem("materials", JSON.stringify(nextInventory));
  }

  const completedAt = getFinishTime(itemToClaim).toISOString();

  const historyItem: ForgeHistoryItem = {
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    itemId: itemToClaim.itemId,
    itemName: itemToClaim.itemName,
    itemCategory: itemToClaim.itemCategory,
    quantity: itemToClaim.quantity,
    minutesPerQuantity: itemToClaim.minutesPerQuantity,
    durationMinutes: itemToClaim.durationMinutes,
    startedAt: itemToClaim.startedAt,
    completedAt,
    claimedAt: new Date().toISOString(),
    materialsUsed,
    deductedMaterials: autoDeductMaterials,
  };

  addForgeHistoryItem(historyItem);
  setForgeHistory(loadForgeHistory());

  setQueue((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            claimed: true,
          }
        : item
    )
  );
}
```

---

## 6. Add auto-deduct toggle UI

Place this above the `Start New Forge` section or above `Current Queue`:

```tsx
<section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg">
  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
    <div>
      <h2 className="text-xl font-bold">Auto Material Deduction</h2>
      <p className="mt-1 text-sm text-zinc-400">
        When enabled, claiming a completed forge subtracts the required materials from your inventory.
      </p>
    </div>

    <label className="flex items-center gap-3 rounded-xl bg-zinc-800 px-4 py-3">
      <input
        type="checkbox"
        checked={autoDeductMaterials}
        onChange={(event) => setAutoDeductMaterials(event.target.checked)}
        className="h-5 w-5"
      />

      <span className="font-semibold">
        {autoDeductMaterials ? "Enabled" : "Disabled"}
      </span>
    </label>
  </div>
</section>
```

---

## 7. Add Forge History Analytics UI

Place this near the bottom of the page, usually above `Current Queue` or below the queue stats:

```tsx
<ForgeHistoryAnalytics
  history={forgeHistory}
  onClearHistory={() => {
    const confirmed = window.confirm("Clear all forge history?");

    if (!confirmed) return;

    clearForgeHistory();
    setForgeHistory([]);
  }}
/>
```

---

## 8. Update Settings export/import

Open:

```txt
src/app/settings/page.tsx
```

Add this key to `STORAGE_KEYS`:

```tsx
"forgeHistory",
```

---

## Result

When you press:

```txt
Mark Claimed
```

the app will:

```txt
1. find the recipe
2. calculate materials used
3. subtract materials from inventory if auto-deduct is enabled
4. save updated inventory
5. add a forge history record
6. update analytics
7. mark the queue item claimed
```
