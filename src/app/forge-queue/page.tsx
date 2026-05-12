"use client";

import { useEffect, useMemo, useState } from "react";

import CustomForgeRecipeManager from "@/components/CustomForgeRecipeManager";
import DemonWedgeGroupedSelector from "@/components/DemonWedgeGroupedSelector";
import InventoryCostChecker from "@/components/InventoryCostChecker";
import RecipeEditor from "@/components/RecipeEditor";

import { demonWedgeRecipes } from "@/data/demon-wedges";
import { forgingRecipes } from "@/data/forging";
import { materials as defaultMaterials } from "@/data/materials";

import {
  getCustomRecipeCategory,
  loadCustomForgeRecipes,
} from "@/lib/customForgeRecipes";

import {
  checkMaterialCosts,
} from "@/lib/inventoryCostChecker";

import {
  requestNotificationPermission,
  sendForgeCompleteNotification,
} from "@/lib/notifications";

import { getRecipeOverride } from "@/lib/recipeOverrides";

import { pushSaveKeyToSupabase } from "@/lib/supabase/realtimeSync";

import type {
  ForgeMaterialRequirement,
  ForgeQueueItem,
  MaterialInventoryItem,
} from "@/lib/types";



type QueueRecipe = {
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

const craftableMaterials: QueueRecipe[] = [
  {
    id: "material-gold-sand",
    name: "Gold Sand",
    category: "Material",
    minutesPerQuantity: 10,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Luno Momento", required: 15 },
      { name: "Snowswift Tail Feather", required: 5 },
      { name: "Fuel Reagent", required: 5 },
      { name: "Statue Debris", required: 2 },
      { name: "Coin", required: 10000 },
    ],
  },
  {
    id: "material-repulsive-crystal",
    name: "Repulsive Crystal",
    category: "Material",
    minutesPerQuantity: 10,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Luno Momento", required: 15 },
      { name: "Vehicle Armour", required: 5 },
      { name: "Insulation Coating", required: 5 },
      { name: "Statue Debris", required: 2 },
      { name: "Coin", required: 10000 },
    ],
  },
  {
    id: "material-filthoid-polymer",
    name: "Filthoid Polymer",
    category: "Material",
    minutesPerQuantity: 25,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Filthoid Tentacle", required: 5 },
      { name: "Projectile", required: 1 },
      { name: "Coin", required: 25000 },
    ],
  },
  {
    id: "material-serum-syringe",
    name: "Serum Syringe",
    category: "Material",
    minutesPerQuantity: 25,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Sacred Candle", required: 5 },
      { name: "Sharpening Potion", required: 1 },
      { name: "Coin", required: 25000 },
    ],
  },
  {
    id: "material-track-shift-module",
    name: "Track-Shift Module",
    category: "Weapon Upgrade",
    minutesPerQuantity: 30,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Precision Magnet", required: 20 },
      { name: "Gold Sand", required: 3 },
      { name: "Repulsive Crystal", required: 3 },
      { name: "Creeping Tendrils", required: 80 },
      { name: "Coin", required: 180000 },
    ],
  },
  {
    id: "material-projectile",
    name: "Projectile",
    category: "Weapon Upgrade",
    minutesPerQuantity: 15,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Gold Sand", required: 4 },
      { name: "Repulsive Crystal", required: 6 },
      { name: "Weaponholder", required: 2 },
      { name: "Coolant", required: 2 },
      { name: "Coin", required: 50000 },
    ],
  },
  {
    id: "material-sharpening-potion",
    name: "Sharpening Potion",
    category: "Weapon Forging",
    minutesPerQuantity: 15,
    supportsQuantity: true,
    maxQuantity: 999,
    materials: [
      { name: "Gold Sand", required: 6 },
      { name: "Repulsive Crystal", required: 4 },
      { name: "Weaponholder", required: 2 },
      { name: "Coolant", required: 2 },
      { name: "Coin", required: 50000 },
    ],
  },
];

function getRemainingMs(item: ForgeQueueItem) {
  const startedAt = new Date(item.startedAt).getTime();
  const finishAt = startedAt + item.durationMinutes * 60 * 1000;

  return Math.max(finishAt - Date.now(), 0);
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function formatDuration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const remainingAfterDays = minutes % 1440;
  const hours = Math.floor(remainingAfterDays / 60);
  const mins = remainingAfterDays % 60;

  if (days > 0) {
    if (hours > 0 && mins > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${hours} hr ${mins} min`;
    }

    if (hours > 0) return `${days} day${days > 1 ? "s" : ""} ${hours} hr`;
    if (mins > 0) return `${days} day${days > 1 ? "s" : ""} ${mins} min`;

    return `${days} day${days > 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    if (mins > 0) return `${hours} hr ${mins} min`;
    return `${hours} hr`;
  }

  return `${mins} min`;
}

function getFinishTime(item: ForgeQueueItem) {
  const startedAt = new Date(item.startedAt).getTime();
  const finishAt = startedAt + item.durationMinutes * 60 * 1000;

  return new Date(finishAt);
}

function getTotalMaterials(
  materials: ForgeMaterialRequirement[],
  quantity: number
) {
  return materials.map((material) => ({
    ...material,
    required: material.required * quantity,
  }));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function ForgeQueuePage() {
  const [queue, setQueue] = useState<ForgeQueueItem[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [notificationStatus, setNotificationStatus] = useState("default");
  const [now, setNow] = useState(Date.now());
  const [, setOverrideRefresh] = useState(0);
  const [customRecipeRefresh, setCustomRecipeRefresh] = useState(0);
  const [materialsInventory, setMaterialsInventory] =
    useState<MaterialInventoryItem[]>(defaultMaterials);

  const queueRecipes: QueueRecipe[] = useMemo(() => {
    const weaponRecipes: QueueRecipe[] = forgingRecipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.weaponName,
      category: `Weapon — ${recipe.weaponType}`,
      minutesPerQuantity: recipe.forgeTimeMinutes,
      supportsQuantity: false,
      maxQuantity: 1,
      materials: recipe.materials,
      itemType: "Weapon",
    }));

    const demonRecipes: QueueRecipe[] = demonWedgeRecipes.map((recipe) => ({
      id: `queue-${recipe.id}`,
      name: recipe.name,
      category: `Demon Wedge — ${recipe.family}${
        recipe.element ? ` • ${recipe.element}` : ""
      }`,
      minutesPerQuantity: 180,
      supportsQuantity: true,
      maxQuantity: 999,
      materials:
        recipe.forgeCostCoins > 0
          ? [
              ...recipe.materials,
              {
                name: "Forge Cost Coin",
                required: recipe.forgeCostCoins,
              },
            ]
          : recipe.materials,
      element: recipe.element,
      itemType: "Demon Wedge",
    }));

    const customRecipes: QueueRecipe[] = loadCustomForgeRecipes().map(
      (recipe) => ({
        id: recipe.id,
        name: recipe.name,
        category: getCustomRecipeCategory(recipe),
        minutesPerQuantity: recipe.minutesPerQuantity,
        supportsQuantity: recipe.supportsQuantity,
        maxQuantity: recipe.maxQuantity,
        materials: recipe.materials,
        element: recipe.element,
        itemType: recipe.itemType,
      })
    );

    return [
      ...craftableMaterials,
      ...customRecipes,
      ...demonRecipes,
      ...weaponRecipes,
    ];
  }, [customRecipeRefresh]);

  const baseRecipe = queueRecipes.find(
    (recipe) => recipe.id === selectedRecipeId
  );

  const override = baseRecipe ? getRecipeOverride(baseRecipe.id) : undefined;

  const selectedRecipe = baseRecipe
    ? {
        ...baseRecipe,
        minutesPerQuantity:
          override?.forgeTimeMinutes ?? baseRecipe.minutesPerQuantity,
        materials: override?.materials ?? baseRecipe.materials,
      }
    : undefined;

  const safeQuantity = selectedRecipe?.supportsQuantity ? quantity : 1;
  const totalDurationMinutes =
    (selectedRecipe?.minutesPerQuantity ?? 0) * safeQuantity;

  const selectedTotalMaterials = selectedRecipe
    ? getTotalMaterials(selectedRecipe.materials, safeQuantity)
    : [];

  const materialCostChecks = checkMaterialCosts(
    selectedTotalMaterials,
    materialsInventory
  );

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const savedMaterials = localStorage.getItem("materials");

    if (savedMaterials) {
      setMaterialsInventory(JSON.parse(savedMaterials));
    }
  }, []);

  useEffect(() => {
    if (!selectedRecipeId && queueRecipes.length > 0) {
      setSelectedRecipeId(queueRecipes[0].id);
    }
  }, [queueRecipes, selectedRecipeId]);

  useEffect(() => {
    if (!selectedRecipe) return;

    if (!selectedRecipe.supportsQuantity) {
      setQuantity(1);
      return;
    }

    if (quantity > selectedRecipe.maxQuantity) {
      setQuantity(selectedRecipe.maxQuantity);
    }

    if (quantity < 1) {
      setQuantity(1);
    }
  }, [selectedRecipe, quantity]);

  useEffect(() => {
    const saved = localStorage.getItem("forgeQueue");

    if (saved) {
      const parsedQueue = JSON.parse(saved) as any[];

      const migratedQueue: ForgeQueueItem[] = parsedQueue.map((item) => ({
        id: item.id,
        itemId: item.itemId ?? item.weaponId ?? "unknown",
        itemName: item.itemName ?? item.weaponName ?? "Unknown Item",
        itemCategory: item.itemCategory ?? item.weaponType ?? "Unknown",
        quantity: item.quantity ?? 1,
        minutesPerQuantity:
          item.minutesPerQuantity ??
          Math.round((item.durationMinutes ?? 0) / (item.quantity ?? 1)) ??
          item.durationMinutes ??
          0,
        startedAt: item.startedAt,
        durationMinutes: item.durationMinutes,
        claimed: item.claimed,
        notified: item.notified ?? false,
      }));

      setQueue(migratedQueue);
    }
  }, []);

  useEffect(() => {
  localStorage.setItem("forgeQueue", JSON.stringify(queue));

  pushSaveKeyToSupabase("forgeQueue").catch(() => {
    // user may not be signed in
  });
}, [queue]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const finishedUnnotified = queue.filter(
      (item) => !item.claimed && !item.notified && getRemainingMs(item) <= 0
    );

    if (finishedUnnotified.length === 0) return;

    finishedUnnotified.forEach((item) => {
      sendForgeCompleteNotification(item.itemName);
    });

    setQueue((prev) =>
      prev.map((item) =>
        finishedUnnotified.some((finished) => finished.id === item.id)
          ? { ...item, notified: true }
          : item
      )
    );
  }, [now, queue]);

  const categories = Array.from(
    new Set(queueRecipes.map((recipe) => recipe.category))
  );

  const filteredRecipes = queueRecipes.filter((recipe) => {
    const searchText =
      `${recipe.name} ${recipe.category} ${recipe.element ?? ""} ${
        recipe.itemType ?? ""
      }`.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || recipe.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const activeQueue = queue.filter((item) => !item.claimed);
  const completedCount = activeQueue.filter(
    (item) => getRemainingMs(item) <= 0
  ).length;

  async function enableNotifications() {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
  }

  function startForge() {
    if (!selectedRecipe) return;

    const queueItem: ForgeQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      itemId: selectedRecipe.id,
      itemName: selectedRecipe.name,
      itemCategory: selectedRecipe.category,
      quantity: safeQuantity,
      minutesPerQuantity: selectedRecipe.minutesPerQuantity,
      startedAt: new Date().toISOString(),
      durationMinutes: totalDurationMinutes,
      claimed: false,
      notified: false,
    };

    setQueue((prev) => [queueItem, ...prev]);
  }

  function markClaimed(id: string) {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, claimed: true } : item))
    );
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function clearClaimed() {
    setQueue((prev) => prev.filter((item) => !item.claimed));
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Forge Queue</h1>
        <p className="mt-2 text-zinc-400">
          Manual timer tracker for weapons, individual Demon Wedges, custom recipes, and forge materials.
        </p>
      </div>

      <section className="mb-6">
        <CustomForgeRecipeManager
          onChanged={() => setCustomRecipeRefresh((prev) => prev + 1)}
        />
      </section>

      <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Notifications</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Get a browser notification when a forge timer finishes.
            </p>
          </div>

          <button
            type="button"
            onClick={enableNotifications}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            {notificationStatus === "granted"
              ? "Notifications Enabled"
              : "Enable Notifications"}
          </button>
        </div>

        {notificationStatus === "denied" && (
          <p className="mt-3 text-sm text-red-300">
            Notifications are blocked in your browser settings for this site.
          </p>
        )}
      </section>

      <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Start New Forge</h2>

        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search weapon, material, or Demon Wedge..."
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none ring-1 ring-zinc-700 focus:ring-zinc-500"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl bg-zinc-800 p-3 text-white outline-none ring-1 ring-zinc-700 focus:ring-zinc-500"
          >
            <option value="All">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={startForge}
            disabled={!selectedRecipeId}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Forge
          </button>
        </div>

        <div className="mt-4">
          <DemonWedgeGroupedSelector
            recipes={filteredRecipes}
            selectedRecipeId={selectedRecipeId}
            onChange={setSelectedRecipeId}
          />
        </div>

        {selectedRecipe && (
          <div className="mt-5 rounded-2xl bg-zinc-950 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
              <div>
                <p className="text-sm text-zinc-400">Selected Item</p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedRecipe.name}
                </p>
                <p className="text-sm text-zinc-500">
                  {selectedRecipe.category}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Time Per Quantity</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatDuration(selectedRecipe.minutesPerQuantity)}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Total Time</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatDuration(totalDurationMinutes)}
                </p>
              </div>
            </div>

            {selectedRecipe.supportsQuantity && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-zinc-300">
                    Quantity: {quantity}
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={selectedRecipe.maxQuantity}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    className="w-24 rounded-lg bg-zinc-800 p-2 text-right"
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max={selectedRecipe.maxQuantity}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(Number(event.target.value))
                  }
                  className="w-full"
                />

                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>1</span>
                  <span>{selectedRecipe.maxQuantity}</span>
                </div>
              </div>
            )}

            {!selectedRecipe.supportsQuantity && (
              <p className="mt-4 text-sm text-zinc-500">
                This item uses a fixed timer and does not use quantity.
              </p>
            )}

            <div className="mt-5">
              <h3 className="mb-3 text-lg font-semibold">
                Required Materials
              </h3>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {selectedTotalMaterials.map((material) => (
                  <div
                    key={`${selectedRecipe.id}-${material.name}`}
                    className="rounded-xl bg-zinc-800 p-3"
                  >
                    <p className="font-medium">{material.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Required: {formatNumber(material.required)}
                    </p>
                  </div>
                ))}
              </div>

              <InventoryCostChecker checks={materialCostChecks} />
            </div>

            <RecipeEditor
              recipeId={selectedRecipe.id}
              recipeName={selectedRecipe.name}
              forgeTimeMinutes={selectedRecipe.minutesPerQuantity}
              materials={selectedRecipe.materials}
              onSaved={() => setOverrideRefresh((prev) => prev + 1)}
            />
          </div>
        )}
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Active Forges</p>
          <p className="mt-2 text-3xl font-bold">{activeQueue.length}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Ready To Claim</p>
          <p className="mt-2 text-3xl font-bold">{completedCount}</p>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Claimed History</p>
          <p className="mt-2 text-3xl font-bold">
            {queue.filter((item) => item.claimed).length}
          </p>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Current Queue</h2>

        <button
          type="button"
          onClick={clearClaimed}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
        >
          Clear claimed
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {queue.length === 0 && (
          <p className="text-zinc-400">No items are currently forging.</p>
        )}

        {queue.map((item) => {
          const remainingMs = getRemainingMs(item);
          const complete = remainingMs <= 0;
          const finishTime = getFinishTime(item);

          return (
            <section
              key={item.id}
              className={`rounded-2xl p-5 shadow-lg ${
                item.claimed ? "bg-zinc-900/50 opacity-60" : "bg-zinc-900"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{item.itemName}</h3>
                  <p className="text-zinc-400">{item.itemCategory}</p>
                  <p className="text-sm text-zinc-500">
                    Quantity: {item.quantity} •{" "}
                    {formatDuration(item.minutesPerQuantity)} each
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    item.claimed
                      ? "bg-zinc-700 text-zinc-300"
                      : complete
                        ? "bg-green-500/20 text-green-300"
                        : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {item.claimed
                    ? "Claimed"
                    : complete
                      ? "Ready"
                      : "Forging"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  Started:{" "}
                  <span className="text-zinc-300">
                    {new Date(item.startedAt).toLocaleString()}
                  </span>
                </p>

                <p>
                  Finishes:{" "}
                  <span className="text-zinc-300">
                    {finishTime.toLocaleString()}
                  </span>
                </p>

                <p>
                  Total duration:{" "}
                  <span className="text-zinc-300">
                    {formatDuration(item.durationMinutes)}
                  </span>
                </p>
              </div>

              <div className="my-5 rounded-xl bg-zinc-800 p-4 text-center">
                <p className="text-sm text-zinc-400">
                  {complete ? "Status" : "Time Remaining"}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {complete ? "Ready to claim" : formatRemaining(remainingMs)}
                </p>
              </div>

              <div className="flex gap-2">
                {!item.claimed && complete && (
                  <button
                    type="button"
                    onClick={() => markClaimed(item.id)}
                    className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-green-400"
                  >
                    Mark Claimed
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
                >
                  Remove
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
