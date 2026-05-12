"use client";

import { useEffect, useMemo, useState } from "react";

import {
  loadMaterialsInventory,
  saveMaterialsInventory,
} from "@/lib/materialInventory";

import type { MaterialInventoryItem } from "@/lib/types";

import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialInventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Custom");
  const [newOwned, setNewOwned] = useState(0);

  useEffect(() => {
    setMaterials(loadMaterialsInventory());
  }, []);

  useEffect(() => {
  if (materials.length > 0) {
    saveMaterialsInventory(materials);

    pushSaveKeyToSupabase("materials").catch(() => {
      // user may not be signed in
    });
  }
}, [materials]);

  const categories = useMemo(
    () => Array.from(new Set(materials.map((item) => item.category ?? "Other"))),
    [materials]
  );

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function updateOwned(id: string | undefined, name: string, owned: number) {
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === id || item.name === name
          ? { ...item, owned: Math.max(owned, 0) }
          : item
      )
    );
  }

  function addMaterial() {
    if (!newName.trim()) {
      alert("Please enter a material name.");
      return;
    }

    const exists = materials.some(
      (item) => item.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );

    if (exists) {
      alert("This material already exists.");
      return;
    }

    setMaterials((prev) => [
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: newName.trim(),
        category: newCategory.trim() || "Custom",
        owned: Math.max(newOwned, 0),
        notes: "",
      },
      ...prev,
    ]);

    setNewName("");
    setNewCategory("Custom");
    setNewOwned(0);
  }

  function removeMaterial(id: string | undefined, name: string) {
    const confirmed = window.confirm(`Delete ${name}?`);
    if (!confirmed) return;

    setMaterials((prev) => prev.filter((item) => !(item.id === id || item.name === name)));
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Materials</h1>
        <p className="mt-2 text-zinc-400">
          Track owned materials. Forge Queue reads these values for Required / Owned / Missing.
        </p>
      </div>

      <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">Add Material</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_160px_auto]">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Material name"
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Category"
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <input
            type="number"
            min="0"
            value={newOwned}
            onChange={(event) => setNewOwned(Number(event.target.value))}
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          />

          <button
            type="button"
            onClick={addMaterial}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            Add
          </button>
        </div>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-[1fr_260px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search materials..."
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800"
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800"
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredMaterials.map((item) => (
          <div key={item.id ?? item.name} className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{item.category ?? "Other"}</p>
              </div>

              <button
                type="button"
                onClick={() => removeMaterial(item.id, item.name)}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                Delete
              </button>
            </div>

            <label className="mb-2 block text-sm text-zinc-300">Owned</label>
            <input
              type="number"
              min="0"
              value={item.owned ?? 0}
              onChange={(event) => updateOwned(item.id, item.name, Number(event.target.value))}
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />

            <p className="mt-3 text-sm text-zinc-500">Saved amount: {formatNumber(item.owned ?? 0)}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
