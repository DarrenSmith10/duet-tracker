"use client";

import { useEffect, useState } from "react";

import type {
  ForgeMaterialRequirement,
  RecipeOverride,
} from "@/lib/types";

import {
  removeRecipeOverride,
  upsertRecipeOverride,
} from "@/lib/recipeOverrides";

export default function RecipeEditor({
  recipeId,
  recipeName,
  forgeTimeMinutes,
  materials,
  onSaved,
}: {
  recipeId: string;
  recipeName: string;
  forgeTimeMinutes: number;
  materials: ForgeMaterialRequirement[];
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(forgeTimeMinutes);
  const [recipeMaterials, setRecipeMaterials] =
    useState<ForgeMaterialRequirement[]>(materials);

  useEffect(() => {
    setTime(forgeTimeMinutes);
    setRecipeMaterials(materials);
  }, [recipeId, forgeTimeMinutes, materials]);

  function updateMaterial(
    index: number,
    field: "name" | "required",
    value: string
  ) {
    setRecipeMaterials((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "required" ? Number(value) : value,
            }
          : item
      )
    );
  }

  function addMaterial() {
    setRecipeMaterials((prev) => [
      ...prev,
      {
        name: "",
        required: 1,
      },
    ]);
  }

  function removeMaterial(index: number) {
    setRecipeMaterials((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function saveRecipe() {
    const cleanedMaterials = recipeMaterials.filter(
      (material) => material.name.trim() && material.required > 0
    );

    const override: RecipeOverride = {
      recipeId,
      forgeTimeMinutes: time,
      materials: cleanedMaterials,
    };

    upsertRecipeOverride(override);
    onSaved?.();

    alert("Recipe override saved.");
  }

  function resetRecipe() {
    const confirmed = window.confirm(
      "Reset this recipe back to the default values?"
    );

    if (!confirmed) return;

    removeRecipeOverride(recipeId);
    onSaved?.();

    window.location.reload();
  }

  return (
    <div className="mt-6 rounded-2xl bg-zinc-900 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Recipe Editor
          </h2>

          <p className="text-sm text-zinc-400">
            Edit the required materials shown above.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          {open ? "Hide Editor" : "Edit Recipe"}
        </button>
      </div>

      {open && (
        <div className="mt-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm text-zinc-300">
              Forge Time / Time Per Quantity (minutes)
            </label>

            <input
              type="number"
              min="1"
              value={time}
              onChange={(event) => setTime(Number(event.target.value))}
              className="w-full rounded-xl bg-zinc-800 p-3 text-white"
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Materials for {recipeName}
              </h3>

              <button
                type="button"
                onClick={addMaterial}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
              >
                Add Material
              </button>
            </div>

            <div className="space-y-3">
              {recipeMaterials.map((material, index) => (
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
                    className="rounded-xl bg-zinc-800 p-3 text-white"
                  />

                  <input
                    type="number"
                    min="0"
                    value={material.required}
                    onChange={(event) =>
                      updateMaterial(index, "required", event.target.value)
                    }
                    className="rounded-xl bg-zinc-800 p-3 text-white"
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

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={saveRecipe}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Save Override
            </button>

            <button
              type="button"
              onClick={resetRecipe}
              className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-400"
            >
              Reset To Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
