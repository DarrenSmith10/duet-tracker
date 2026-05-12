import type { ForgeMaterialRequirement } from "@/lib/types";
import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";

export type CustomForgeRecipe = {
  id: string;
  name: string;
  itemType: "Weapon" | "Material" | "Demon Wedge";
  category: string;
  element: string;
  minutesPerQuantity: number;
  supportsQuantity: boolean;
  maxQuantity: number;
  materials: ForgeMaterialRequirement[];
  notes: string;
};

const STORAGE_KEY = "customForgeRecipes";

export function loadCustomForgeRecipes(): CustomForgeRecipe[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveCustomForgeRecipes(recipes: CustomForgeRecipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function addCustomForgeRecipe(recipe: CustomForgeRecipe) {
  const recipes = loadCustomForgeRecipes();
  saveCustomForgeRecipes([recipe, ...recipes]);
  pushSaveKeyToSupabase("customForgeRecipes").catch(() => {});
}

export function updateCustomForgeRecipe(updatedRecipe: CustomForgeRecipe) {
  const recipes = loadCustomForgeRecipes();
  const nextRecipes = recipes.map((recipe) =>
    recipe.id === updatedRecipe.id ? updatedRecipe : recipe
  );
  saveCustomForgeRecipes(nextRecipes);
  pushSaveKeyToSupabase("customForgeRecipes").catch(() => {});
}

export function deleteCustomForgeRecipe(recipeId: string) {
  const recipes = loadCustomForgeRecipes().filter(
    (recipe) => recipe.id !== recipeId
  );
  saveCustomForgeRecipes(recipes);
  pushSaveKeyToSupabase("customForgeRecipes").catch(() => {});
}

export function getCustomRecipeCategory(recipe: CustomForgeRecipe) {
  if (recipe.itemType === "Demon Wedge") {
    if (recipe.element && recipe.category) {
      return `Demon Wedge — ${recipe.category} • ${recipe.element}`;
    }
    if (recipe.category) return `Demon Wedge — ${recipe.category}`;
    return "Demon Wedge — Custom Demon Wedge";
  }

  if (recipe.itemType === "Weapon") return recipe.category || "Custom Weapon";

  return recipe.category || "Custom Material";
}
