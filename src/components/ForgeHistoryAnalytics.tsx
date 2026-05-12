"use client";

import type { ForgeHistoryItem } from "@/lib/forgeHistory";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDuration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function ForgeHistoryAnalytics({
  history,
  onClearHistory,
}: {
  history: ForgeHistoryItem[];
  onClearHistory: () => void;
}) {
  const totalCrafts = history.length;
  const totalQuantity = history.reduce((total, item) => total + item.quantity, 0);
  const totalMinutes = history.reduce(
    (total, item) => total + item.durationMinutes,
    0
  );
  const deductedCount = history.filter((item) => item.deductedMaterials).length;

  const recentHistory = history.slice(0, 8);

  const categoryCounts = history.reduce<Record<string, number>>((groups, item) => {
    groups[item.itemCategory] = (groups[item.itemCategory] ?? 0) + 1;
    return groups;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section className="mb-6 rounded-2xl bg-zinc-900 p-5 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Forge History & Analytics</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Completed crafts, claimed items, and material deduction tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
        >
          Clear History
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Completed Crafts</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(totalCrafts)}</p>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Total Quantity</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(totalQuantity)}</p>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Time Tracked</p>
          <p className="mt-2 text-3xl font-bold">{formatDuration(totalMinutes)}</p>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Deductions</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(deductedCount)}</p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="mb-6 rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
          <h3 className="mb-3 text-lg font-semibold">Top Categories</h3>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {topCategories.map(([category, count]) => (
              <div key={category} className="rounded-xl bg-zinc-900 p-3">
                <p className="font-medium">{category}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatNumber(count)} craft{count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg font-semibold">Recent Forge History</h3>

        {recentHistory.length === 0 && (
          <p className="text-zinc-400">No forge history yet.</p>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recentHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-zinc-950 p-4 ring-1 ring-zinc-800"
            >
              <p className="font-semibold">{item.itemName}</p>

              <p className="mt-1 text-sm text-zinc-400">
                {item.itemCategory} • Qty {item.quantity}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Claimed: {new Date(item.claimedAt).toLocaleString()}
              </p>

              <p
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  item.deductedMaterials
                    ? "bg-green-500/20 text-green-300"
                    : "bg-zinc-700 text-zinc-300"
                }`}
              >
                {item.deductedMaterials ? "Materials Deducted" : "No Deduction"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
