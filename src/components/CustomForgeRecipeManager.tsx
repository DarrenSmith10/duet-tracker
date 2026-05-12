"use client";

import { useEffect, useState } from "react";

import {
  addCustomForgeRecipe,
  deleteCustomForgeRecipe,
  loadCustomForgeRecipes,
  updateCustomForgeRecipe,
  type CustomForgeRecipe,
} from "@/lib/customForgeRecipes";

import type { ForgeMaterialRequirement } from "@/lib/types";

const elementOptions = [
  "None",
  "Anemo",
  "Electro",
  "Hydro",
  "Lumino",
  "Pyro",
  "Umbro",
];

const defaultMaterials: ForgeMaterialRequirement[] = [
  {
    name: "Coin",
    required: 0,
  },
];

function createEmptyRecipe(): CustomForgeRecipe {
  return {
    id: "",
    name: "",
    itemType: "Material",
    category: "Custom Material",
    element: "",
    minutesPerQuantity: 10,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: defaultMaterials,
    notes: "",
  };
}

export default function CustomForgeRecipeManager({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [recipes, setRecipes] = useState<CustomForgeRecipe[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomForgeRecipe>(createEmptyRecipe());

  useEffect(() => {
    setRecipes(loadCustomForgeRecipes());
  }, []);

  function refreshRecipes() {
    setRecipes(loadCustomForgeRecipes());
    onChanged?.();
  }

  function resetDraft() {
    setDraft(createEmptyRecipe());
    setEditingRecipeId(null);
  }

  function setDraftField<K extends keyof CustomForgeRecipe>(
    field: K,
    value: CustomForgeRecipe[K]
  ) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateMaterial(
    index: number,
    field: "name" | "required",
    value: string
  ) {
    setDraft((prev) => ({
      ...prev,
      materials: prev.materials.map((material, materialIndex) =>
        materialIndex === index
          ? {
              ...material,
              [field]: field === "required" ? Number(value) : value,
            }
          : material
      ),
    }));
  }

  function addMaterial() {
    setDraft((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          name: "",
          required: 1,
        },
      ],
    }));
  }

  function removeMaterial(index: number) {
    setDraft((prev) => ({
      ...prev,
      materials: prev.materials.filter(
        (_, materialIndex) => materialIndex !== index
      ),
    }));
  }

  function startEditing(recipe: CustomForgeRecipe) {
    setDraft({
      ...recipe,
      materials:
        recipe.materials.length > 0
          ? recipe.materials
          : defaultMaterials,
    });
    setEditingRecipeId(recipe.id);
    setOpen(true);
  }

  function saveRecipe() {
    if (!draft.name.trim()) {
      alert("Please add a recipe name.");
      return;
    }

    const cleanMaterials = draft.materials.filter(
      (material) => material.name.trim() && material.required > 0
    );

    const savedRecipe: CustomForgeRecipe = {
      ...draft,
      id:
        editingRecipeId ??
        `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: draft.name.trim(),
      category: draft.category.trim() || `Custom ${draft.itemType}`,
      element: draft.element === "None" ? "" : draft.element,
      maxQuantity: draft.supportsQuantity ? draft.maxQuantity : 1,
      materials: cleanMaterials,
    };

    if (editingRecipeId) {
      updateCustomForgeRecipe(savedRecipe);
      alert("Custom recipe updated.");
    } else {
      addCustomForgeRecipe(savedRecipe);
      alert("Custom recipe added.");
    }

    resetDraft();
    refreshRecipes();
  }

  function removeRecipe(recipeId: string) {
    const confirmed = window.confirm("Delete this custom recipe?");
    if (!confirmed) return;

    deleteCustomForgeRecipe(recipeId);

    if (editingRecipeId === recipeId) resetDraft();

    refreshRecipes();
  }

  const editorTitle = editingRecipeId
    ? "Edit Custom Recipe"
    : "Add Custom Recipe";

  return (
    <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold">Custom Recipe System</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Add, rename, edit, and delete custom weapons, materials, and Demon Wedges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!open) resetDraft();
            setOpen((current) => !current);
          }}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          {open ? "Hide Recipe Editor" : "Add Custom Recipe"}
        </button>
      </div>

      {open && (
        <div className="mt-6 rounded-2xl bg-zinc-950 p-4">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">{editorTitle}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Change name, type, category, element, time, materials, and notes.
              </p>
            </div>

            {editingRecipeId && (
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Recipe Name
              </label>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraftField("name", event.target.value)
                }
                placeholder="Example: New Demon Wedge"
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Item Type
              </label>
              <select
                value={draft.itemType}
                onChange={(event) =>
                  setDraftField(
                    "itemType",
                    event.target.value as CustomForgeRecipe["itemType"]
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
              >
                <option value="Material">Material</option>
                <option value="Weapon">Weapon</option>
                <option value="Demon Wedge">Demon Wedge</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Group / Category
              </label>
              <input
                value={draft.category}
                onChange={(event) =>
                  setDraftField("category", event.target.value)
                }
                placeholder="Example: Griffin, Custom Weapon, Material"
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Element
              </label>
              <select
                value={draft.element || "None"}
                onChange={(event) =>
                  setDraftField(
                    "element",
                    event.target.value === "None" ? "" : event.target.value
                  )
                }
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
              >
                {elementOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Time Per Quantity (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={draft.minutesPerQuantity}
                onChange={(event) =>
                  setDraftField("minutesPerQuantity", Number(event.target.value))
                }
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Max Quantity
              </label>
              <input
                type="number"
                min="1"
                value={draft.maxQuantity}
                disabled={!draft.supportsQuantity}
                onChange={(event) =>
                  setDraftField("maxQuantity", Number(event.target.value))
                }
                className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-800 p-3">
            <input
              type="checkbox"
              checked={draft.supportsQuantity}
              onChange={(event) =>
                setDraftField("supportsQuantity", event.target.checked)
              }
              className="h-5 w-5"
            />
            <span>Supports quantity slider/input</span>
          </label>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Materials Required</h3>
              <button
                type="button"
                onClick={addMaterial}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
              >
                Add Material
              </button>
            </div>

            <div className="space-y-3">
              {draft.materials.map((material, index) => (
                <div
                  key={`${material.name}-${index}`}
                  className="grid gap-3 md:grid-cols-[1fr_140px_auto]"
                >
                  <input
                    value={material.name}
                    onChange={(event) =>
                      updateMaterial(index, "name", event.target.value)
                    }
                    placeholder="Material name"
                    className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
                  />

                  <input
                    type="number"
                    min="0"
                    value={material.required}
                    onChange={(event) =>
                      updateMaterial(index, "required", event.target.value)
                    }
                    className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-300">Notes</label>
            <textarea
              value={draft.notes}
              onChange={(event) =>
                setDraftField("notes", event.target.value)
              }
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={saveRecipe}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              {editingRecipeId ? "Save Changes" : "Save Custom Recipe"}
            </button>

            {editingRecipeId && (
              <button
                type="button"
                onClick={() => removeRecipe(editingRecipeId)}
                className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-400"
              >
                Delete This Recipe
              </button>
            )}
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">Custom Recipes</h3>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-xl bg-zinc-950 p-4 ring-1 ring-zinc-800"
              >
                <p className="font-semibold">{recipe.name}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {recipe.itemType}
                  {recipe.element ? ` • ${recipe.element}` : ""}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {recipe.minutesPerQuantity} min
                  {recipe.supportsQuantity ? " each" : ""} •{" "}
                  {recipe.materials.length} material
                  {recipe.materials.length === 1 ? "" : "s"}
                </p>

                {recipe.notes && (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-500">
                    {recipe.notes}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(recipe)}
                    className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => removeRecipe(recipe.id)}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
