"use client";

import { useEffect, useState } from "react";

import { weapons as defaultWeapons } from "@/data/weapons";

import type { Weapon } from "@/lib/types";

export default function WeaponsPage() {
  const [weapons, setWeapons] = useState<Weapon[]>(defaultWeapons);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem("weapons");

    if (saved) {
      setWeapons(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weapons", JSON.stringify(weapons));
  }, [weapons]);

  const weaponTypes = Array.from(new Set(weapons.map((weapon) => weapon.type)));
  const weaponRanges = Array.from(new Set(weapons.map((weapon) => weapon.range)));

  const filteredWeapons = weapons.filter((weapon) => {
    const matchesSearch = weapon.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || weapon.type === typeFilter;

    const matchesRange =
      rangeFilter === "All" || weapon.range === rangeFilter;

    return matchesSearch && matchesType && matchesRange;
  });

  function toggleOwned(id: string) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              owned: !weapon.owned,
            }
          : weapon
      )
    );
  }

  function toggleCompleted(id: string) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              completed: !weapon.completed,
            }
          : weapon
      )
    );
  }

  function updateWeaponLevel(id: string, value: number) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              weaponLevel: value,
            }
          : weapon
      )
    );
  }

  function updateTrackShiftModules(id: string, value: number) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              trackShiftModules: value,
            }
          : weapon
      )
    );
  }

  function updateSmeltLevel(id: string, value: number) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              smeltLevel: value,
            }
          : weapon
      )
    );
  }

  function updateNotes(id: string, value: string) {
    setWeapons((prev) =>
      prev.map((weapon) =>
        weapon.id === id
          ? {
              ...weapon,
              notes: value,
            }
          : weapon
      )
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Weapon Tracker</h1>
        <p className="mt-2 text-zinc-400">
          Tracking {weapons.filter((weapon) => weapon.owned).length}/
          {weapons.length} owned weapons.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search weapons..."
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

        <select
          value={rangeFilter}
          onChange={(event) => setRangeFilter(event.target.value)}
          className="rounded-xl bg-zinc-900 p-3 text-white outline-none ring-1 ring-zinc-800 focus:ring-zinc-600"
        >
          <option value="All">All ranges</option>
          {weaponRanges.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredWeapons.map((weapon) => (
          <section
            key={weapon.id}
            className="rounded-2xl bg-zinc-900 p-5 shadow-lg"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{weapon.name}</h2>

              <p className="text-zinc-400">
                {weapon.type} • {weapon.range}
              </p>

              <p className="text-sm text-zinc-500">{weapon.source}</p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <input
                  type="checkbox"
                  checked={weapon.owned}
                  onChange={() => toggleOwned(weapon.id)}
                />{" "}
                Owned
              </label>

              <label className="block">
                <input
                  type="checkbox"
                  checked={weapon.completed}
                  onChange={() => toggleCompleted(weapon.id)}
                />{" "}
                Completed Build
              </label>

              <div>
                <label className="mb-1 block text-sm">Weapon Level</label>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weapon.weaponLevel}
                  onChange={(event) =>
                    updateWeaponLevel(weapon.id, Number(event.target.value))
                  }
                  className="w-full rounded-lg bg-zinc-800 p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Track-Shift Modules
                </label>

                <input
                  type="number"
                  min="0"
                  value={weapon.trackShiftModules}
                  onChange={(event) =>
                    updateTrackShiftModules(
                      weapon.id,
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg bg-zinc-800 p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Smelt Level</label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={weapon.smeltLevel}
                  onChange={(event) =>
                    updateSmeltLevel(weapon.id, Number(event.target.value))
                  }
                  className="w-full rounded-lg bg-zinc-800 p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Notes</label>

                <textarea
                  value={weapon.notes}
                  onChange={(event) =>
                    updateNotes(weapon.id, event.target.value)
                  }
                  className="min-h-[100px] w-full rounded-lg bg-zinc-800 p-2"
                  placeholder="Build notes, forging notes, farming goals, etc..."
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
