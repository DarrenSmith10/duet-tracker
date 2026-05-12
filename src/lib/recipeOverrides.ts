import type { RecipeOverride } from "@/lib/types";

const STORAGE_KEY = "recipeOverrides";

export function loadRecipeOverrides(): RecipeOverride[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveRecipeOverrides(overrides: RecipeOverride[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getRecipeOverride(recipeId: string): RecipeOverride | undefined {
  return loadRecipeOverrides().find((item) => item.recipeId === recipeId);
}

export function upsertRecipeOverride(override: RecipeOverride) {
  const overrides = loadRecipeOverrides();

  const existingIndex = overrides.findIndex(
    (item) => item.recipeId === override.recipeId
  );

  if (existingIndex >= 0) {
    overrides[existingIndex] = override;
  } else {
    overrides.push(override);
  }

  saveRecipeOverrides(overrides);
}

export function removeRecipeOverride(recipeId: string) {
  const overrides = loadRecipeOverrides().filter(
    (item) => item.recipeId !== recipeId
  );

  saveRecipeOverrides(overrides);
}
