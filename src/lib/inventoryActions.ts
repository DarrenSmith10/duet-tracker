import {
  getMaterialOwnedValue,
  materialNamesMatch,
} from "@/lib/materialInventory";

import type {
  ForgeMaterialRequirement,
  MaterialInventoryItem,
} from "@/lib/types";

export function deductMaterialsFromInventory(
  inventory: MaterialInventoryItem[],
  materialsToDeduct: ForgeMaterialRequirement[]
): MaterialInventoryItem[] {
  return inventory.map((inventoryItem) => {
    const requiredItem = materialsToDeduct.find((material) =>
      materialNamesMatch(material.name, inventoryItem.name)
    );

    if (!requiredItem) return inventoryItem;

    return {
      ...inventoryItem,
      owned: Math.max(getMaterialOwnedValue(inventoryItem) - requiredItem.required, 0),
    };
  });
}
