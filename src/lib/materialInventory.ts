import { materials as defaultMaterials } from "@/data/materials";
import type { MaterialInventoryItem } from "@/lib/types";

export const MATERIALS_STORAGE_KEY = "materials";

export function normalizeMaterialName(value: string) {
  return value.trim().toLowerCase().replace(/['’]/g, "").replace(/[\-_]+/g, " ").replace(/\s+/g, " ");
}

export function getMaterialAliases(name: string) {
  const normalized = normalizeMaterialName(name);
  const aliases: Record<string, string[]> = {
    coin: ["coin", "coins", "forge cost coin"],
    coins: ["coin", "coins", "forge cost coin"],
    "forge cost coin": ["coin", "coins", "forge cost coin"],
    blueprint: ["blueprint", "blueprints"],
    blueprints: ["blueprint", "blueprints"],
    "track shift module": ["track shift module", "track shift", "trackshift module"],
  };
  return aliases[normalized] ?? [normalized];
}

export function materialNamesMatch(a: string, b: string) {
  const aliasesA = getMaterialAliases(a);
  const aliasesB = getMaterialAliases(b);
  return aliasesA.some((alias) => aliasesB.includes(alias));
}

export function getMaterialOwnedValue(item: MaterialInventoryItem) {
  const maybeItem = item as unknown as { owned?: number; amount?: number; quantity?: number; count?: number };
  return maybeItem.owned ?? maybeItem.amount ?? maybeItem.quantity ?? maybeItem.count ?? 0;
}

export function loadMaterialsInventory() {
  if (typeof window === "undefined") return defaultMaterials;
  const saved = localStorage.getItem(MATERIALS_STORAGE_KEY);
  if (!saved) return defaultMaterials;

  try {
    const savedMaterials = JSON.parse(saved) as MaterialInventoryItem[];
    const mergedDefaults = defaultMaterials.map((defaultItem) => {
      const savedItem = savedMaterials.find((item) => materialNamesMatch(item.name, defaultItem.name));
      return { ...defaultItem, owned: savedItem ? getMaterialOwnedValue(savedItem) : defaultItem.owned ?? 0 };
    });
    const customSavedMaterials = savedMaterials.filter(
      (savedItem) => !mergedDefaults.some((defaultItem) => materialNamesMatch(defaultItem.name, savedItem.name))
    );
    return [...mergedDefaults, ...customSavedMaterials.map((item) => ({ ...item, owned: getMaterialOwnedValue(item) }))];
  } catch {
    return defaultMaterials;
  }
}

export function saveMaterialsInventory(items: MaterialInventoryItem[]) {
  localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(items));
}
