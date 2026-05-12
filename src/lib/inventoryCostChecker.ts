import {
  getMaterialOwnedValue,
  materialNamesMatch,
} from "@/lib/materialInventory";

import type {
  ForgeMaterialRequirement,
  MaterialInventoryItem,
} from "@/lib/types";

export type MaterialCostCheck = {
  name: string;
  required: number;
  owned: number;
  missing: number;
  enough: boolean;
};

export function checkMaterialCosts(
  requiredMaterials: ForgeMaterialRequirement[],
  inventory: MaterialInventoryItem[]
): MaterialCostCheck[] {
  return requiredMaterials.map((material) => {
    const inventoryItem = inventory.find((item) =>
      materialNamesMatch(item.name, material.name)
    );

    const owned = inventoryItem ? getMaterialOwnedValue(inventoryItem) : 0;
    const missing = Math.max(material.required - owned, 0);

    return {
      name: material.name,
      required: material.required,
      owned,
      missing,
      enough: missing <= 0,
    };
  });
}
