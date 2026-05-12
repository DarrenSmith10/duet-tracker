# Forge Queue Inventory Cost Checker

## Copy files

```txt
src/lib/inventoryCostChecker.ts
src/components/InventoryCostChecker.tsx
```

## Update `src/app/forge-queue/page.tsx`

Add imports:

```tsx
import InventoryCostChecker from "@/components/InventoryCostChecker";

import { materials as defaultMaterials } from "@/data/materials";

import {
  checkMaterialCosts,
} from "@/lib/inventoryCostChecker";
```

Update your type import:

```tsx
import type {
  ForgeMaterialRequirement,
  ForgeQueueItem,
  MaterialInventoryItem,
} from "@/lib/types";
```

Inside `ForgeQueuePage()` add:

```tsx
const [materialsInventory, setMaterialsInventory] =
  useState<MaterialInventoryItem[]>(defaultMaterials);
```

Add this effect:

```tsx
useEffect(() => {
  const savedMaterials = localStorage.getItem("materials");

  if (savedMaterials) {
    setMaterialsInventory(JSON.parse(savedMaterials));
  }
}, []);
```

After:

```tsx
const selectedTotalMaterials = selectedRecipe
  ? getTotalMaterials(selectedRecipe.materials, safeQuantity)
  : [];
```

add:

```tsx
const materialCostChecks = checkMaterialCosts(
  selectedTotalMaterials,
  materialsInventory
);
```

Under the Required Materials grid, add:

```tsx
<InventoryCostChecker checks={materialCostChecks} />
```

## Result

Forge Queue will show:

```txt
Required
Owned
Missing
OK / Missing
```
