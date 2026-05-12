"use client";

import { useEffect, useMemo, useState } from "react";

import { forgingRecipes } from "@/data/forging";
import { materials as defaultMaterials } from "@/data/materials";

import type { MaterialInventoryItem } from "@/lib/types";

export default function ForgingPage() {
  const [materials, setMaterials] =
    useState<MaterialInventoryItem[]>(defaultMaterials);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem("materials");

    if (saved) {
      setMaterials(JSON.parse(saved));
    }
  }, []);

  const materialMap = useMemo(() => {
    return new Map(materials.map((material) => [material.name, material.owned]));
  }, [materials]);

  const weaponTypes = Array.from(
    new Set(forgingRecipes.map((recipe) => recipe.weaponType))
  );

  const filteredRecipes = forgingRecipes.filter((recipe) => {
    const matchesSearch = recipe.weaponName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || recipe.weaponType === typeFilter;

    return matchesSearch && matchesType;
  });

  function getOwned(name: string) {
    return materialMap.get(name) ?? 0;
  }

  function canForge(recipeId: string) {
    const recipe = forgingRecipes.find((item) => item.id === recipeId);

    if (!recipe) return false;

    return recipe.materials.every(
      (material) => getOwned(material.name) >= material.required
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Forging Planner</h1>
        <p className="mt-2 text-zinc-400">
          Uses your Material Inventory page to calculate missing materials.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search weapon recipes..."
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        >
          <option value="All">All weapon types</option>

          {weaponTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe) => {
          const ready = canForge(recipe.id);

          return (
            <section
              key={recipe.id}
              className="rounded-2xl bg-zinc-900 p-5 shadow-lg"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {recipe.weaponName}
                    </h2>

                    <p className="text-zinc-400">{recipe.weaponType}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      ready
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {ready ? "Ready" : "Missing"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Forge time: {recipe.forgeTimeMinutes} minutes
                </p>
              </div>

              <div className="space-y-3">
                {recipe.materials.map((material) => {
                  const owned = getOwned(material.name);
                  const missing = Math.max(material.required - owned, 0);

                  return (
                    <div key={material.name} className="rounded-xl bg-zinc-800 p-3">
                      <div className="flex justify-between gap-3">
                        <span className="font-medium">{material.name}</span>
                        <span>
                          {owned}/{material.required}
                        </span>
                      </div>

                      {missing > 0 ? (
                        <p className="mt-1 text-sm text-red-300">
                          Missing {missing}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-green-300">
                          Enough
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-sm text-zinc-500">
                <p>
                  Primary ascension material:{" "}
                  {recipe.primaryAscensionMaterial || "Unknown"}
                </p>
                <p>
                  Secondary ascension material:{" "}
                  {recipe.secondaryAscensionMaterial || "Unknown"}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
