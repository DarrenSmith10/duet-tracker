"use client";

import { useMemo, useState } from "react";

import type { ForgeMaterialRequirement } from "@/lib/types";

export type GroupedForgeRecipe = {
  id: string;
  name: string;
  category: string;
  minutesPerQuantity: number;
  supportsQuantity: boolean;
  maxQuantity: number;
  materials: ForgeMaterialRequirement[];
  element?: string;
  itemType?: string;
};

function getGroupTitle(recipe: GroupedForgeRecipe) {
  if (recipe.category.startsWith("Demon Wedge")) {
    return recipe.category.replace("Demon Wedge — ", "");
  }

  return recipe.category;
}

function groupRecipes(recipes: GroupedForgeRecipe[]) {
  const grouped = recipes.reduce<Record<string, GroupedForgeRecipe[]>>(
    (groups, recipe) => {
      const title = getGroupTitle(recipe);

      if (!groups[title]) groups[title] = [];

      groups[title].push(recipe);

      return groups;
    },
    {}
  );

  return Object.entries(grouped)
    .map(([title, recipes]) => ({
      title,
      recipes: recipes.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function DemonWedgeGroupedSelector({
  recipes,
  selectedRecipeId,
  onChange,
}: {
  recipes: GroupedForgeRecipe[];
  selectedRecipeId: string;
  onChange: (recipeId: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const groups = useMemo(() => groupRecipes(recipes), [recipes]);

  const selectedRecipe = recipes.find(
    (recipe) => recipe.id === selectedRecipeId
  );

  return (
    <div className="space-y-4">
      <div className="md:hidden">
        <label className="mb-2 block text-sm font-semibold text-zinc-300">
          Select Forge Item
        </label>

        <select
          value={selectedRecipeId}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[56px] w-full rounded-xl bg-zinc-800 p-4 text-lg text-white outline-none ring-1 ring-zinc-700 focus:ring-zinc-500"
        >
          {groups.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name} — {recipe.minutesPerQuantity} min
                  {recipe.supportsQuantity ? " each" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="hidden md:block">
        <label className="mb-2 block text-sm font-semibold text-zinc-300">
          Select Forge Item
        </label>

        <div className="grid gap-3 xl:grid-cols-[340px_1fr]">
          <div className="max-h-[540px] overflow-y-auto rounded-2xl bg-zinc-950 p-3 ring-1 ring-zinc-800">
            <div className="space-y-2">
              {groups.map((group) => {
                const groupHasSelected = group.recipes.some(
                  (recipe) => recipe.id === selectedRecipeId
                );

                const expanded = openGroup === group.title || groupHasSelected;

                return (
                  <section
                    key={group.title}
                    className="overflow-hidden rounded-xl bg-zinc-900"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup((current) =>
                          current === group.title ? null : group.title
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-800"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {group.title}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {group.recipes.length} item
                          {group.recipes.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <span className="text-zinc-400">
                        {expanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {expanded && (
                      <div className="space-y-1 border-t border-zinc-800 p-2">
                        {group.recipes.map((recipe) => {
                          const active = recipe.id === selectedRecipeId;

                          return (
                            <button
                              key={recipe.id}
                              type="button"
                              onClick={() => onChange(recipe.id)}
                              className={`w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                                active
                                  ? "bg-white text-zinc-950"
                                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                              }`}
                            >
                              <p className="font-semibold">{recipe.name}</p>

                              <p
                                className={`mt-1 text-xs ${
                                  active ? "text-zinc-700" : "text-zinc-500"
                                }`}
                              >
                                {recipe.minutesPerQuantity} min
                                {recipe.supportsQuantity ? " each" : ""} •{" "}
                                {recipe.materials.length} material
                                {recipe.materials.length === 1 ? "" : "s"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800">
            {selectedRecipe ? (
              <div>
                <p className="text-sm text-zinc-400">Selected Item</p>

                <h3 className="mt-1 text-2xl font-bold">
                  {selectedRecipe.name}
                </h3>

                <p className="mt-1 text-zinc-500">
                  {selectedRecipe.category}
                </p>

                {(selectedRecipe.itemType || selectedRecipe.element) && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {selectedRecipe.itemType ? `Type: ${selectedRecipe.itemType}` : ""}
                    {selectedRecipe.itemType && selectedRecipe.element ? " • " : ""}
                    {selectedRecipe.element ? `Element: ${selectedRecipe.element}` : ""}
                  </p>
                )}

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Time</p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedRecipe.minutesPerQuantity} min
                      {selectedRecipe.supportsQuantity ? " each" : ""}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Materials</p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedRecipe.materials.length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">Select a forge item.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
