"use client";

import { useEffect, useMemo, useState } from "react";

import { demonWedgeRecipes } from "@/data/demon-wedges";
import { materials as defaultMaterials } from "@/data/materials";

import type { DemonWedgeRecipe, MaterialInventoryItem } from "@/lib/types";

export default function DemonWedgesPage() {
  const [materials, setMaterials] =
    useState<MaterialInventoryItem[]>(defaultMaterials);

  const [wedges, setWedges] =
    useState<DemonWedgeRecipe[]>(demonWedgeRecipes);

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [elementFilter, setElementFilter] = useState("All");

  useEffect(() => {
    const savedMaterials = localStorage.getItem("materials");
    const savedWedges = localStorage.getItem("demonWedges");

    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }

    if (savedWedges) {
      setWedges(JSON.parse(savedWedges));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("demonWedges", JSON.stringify(wedges));
  }, [wedges]);

  const materialMap = useMemo(() => {
    return new Map(materials.map((material) => [material.name, material.owned]));
  }, [materials]);

  const sections = Array.from(new Set(wedges.map((wedge) => wedge.section)));
  const elements = Array.from(
    new Set(wedges.map((wedge) => wedge.element).filter(Boolean))
  );

  const filteredWedges = wedges.filter((wedge) => {
    const searchText = `${wedge.name} ${wedge.family} ${wedge.section} ${wedge.element}`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesSection =
      sectionFilter === "All" || wedge.section === sectionFilter;
    const matchesElement =
      elementFilter === "All" || wedge.element === elementFilter;

    return matchesSearch && matchesSection && matchesElement;
  });

  function getOwned(name: string) {
    return materialMap.get(name) ?? 0;
  }

  function isReady(wedge: DemonWedgeRecipe) {
    return wedge.materials.every(
      (material) => getOwned(material.name) >= material.required
    );
  }

  function toggleOwned(id: string) {
    setWedges((prev) =>
      prev.map((wedge) =>
        wedge.id === id
          ? {
              ...wedge,
              owned: !wedge.owned,
            }
          : wedge
      )
    );
  }

  function updateLevel(id: string, level: number) {
    setWedges((prev) =>
      prev.map((wedge) =>
        wedge.id === id
          ? {
              ...wedge,
              level,
            }
          : wedge
      )
    );
  }

  function updateNotes(id: string, notes: string) {
    setWedges((prev) =>
      prev.map((wedge) =>
        wedge.id === id
          ? {
              ...wedge,
              notes,
            }
          : wedge
      )
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Demon Wedge Forging</h1>

        <p className="mt-2 text-zinc-400">
          Track Demon Wedge recipes, required materials, owned wedges, and missing resources.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Demon Wedges..."
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        />

        <select
          value={sectionFilter}
          onChange={(event) => setSectionFilter(event.target.value)}
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        >
          <option value="All">All sections</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>

        <select
          value={elementFilter}
          onChange={(event) => setElementFilter(event.target.value)}
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        >
          <option value="All">All elements</option>
          {elements.map((element) => (
            <option key={element} value={element}>
              {element}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Owned Wedges</p>
          <p className="mt-2 text-3xl font-bold">
            {wedges.filter((wedge) => wedge.owned).length}/{wedges.length}
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Ready To Forge</p>
          <p className="mt-2 text-3xl font-bold">
            {wedges.filter((wedge) => isReady(wedge)).length}
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Showing</p>
          <p className="mt-2 text-3xl font-bold">{filteredWedges.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredWedges.map((wedge) => {
          const ready = isReady(wedge);

          return (
            <section
              key={wedge.id}
              className="rounded-2xl bg-zinc-900 p-5 shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{wedge.name}</h2>
                  <p className="text-zinc-400">
                    {wedge.family} {wedge.element ? `• ${wedge.element}` : ""}
                  </p>
                  <p className="text-sm text-zinc-500">{wedge.section}</p>
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

              <div className="mb-4 space-y-2">
                <label className="block">
                  <input
                    type="checkbox"
                    checked={wedge.owned}
                    onChange={() => toggleOwned(wedge.id)}
                  />{" "}
                  Owned
                </label>

                <div>
                  <label className="mb-1 block text-sm">Current Level</label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={wedge.level}
                    onChange={(event) =>
                      updateLevel(wedge.id, Number(event.target.value))
                    }
                    className="w-full rounded-lg bg-zinc-800 p-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {wedge.materials.map((material) => {
                  const owned = getOwned(material.name);
                  const missing = Math.max(material.required - owned, 0);

                  return (
                    <div
                      key={`${wedge.id}-${material.name}`}
                      className="rounded-xl bg-zinc-800 p-3"
                    >
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
                        <p className="mt-1 text-sm text-green-300">Enough</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {wedge.forgeCostCoins > 0 && (
                <p className="mt-4 text-sm text-zinc-500">
                  Extra forging cost: {wedge.forgeCostCoins.toLocaleString()} Coins
                </p>
              )}

              {wedge.materialSource && (
                <p className="mt-2 text-sm text-zinc-500">
                  Material source: {wedge.materialSource}
                </p>
              )}

              <div className="mt-4">
                <label className="mb-1 block text-sm">Notes</label>

                <textarea
                  value={wedge.notes}
                  onChange={(event) => updateNotes(wedge.id, event.target.value)}
                  className="min-h-[80px] w-full rounded-lg bg-zinc-800 p-2"
                  placeholder="Drop location, farming plan, build use, etc..."
                />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
