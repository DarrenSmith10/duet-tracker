"use client";

import type { MaterialCostCheck } from "@/lib/inventoryCostChecker";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function InventoryCostChecker({
  checks,
}: {
  checks: MaterialCostCheck[];
}) {
  const missingCount = checks.filter((item) => !item.enough).length;
  const canCraft = missingCount === 0;

  return (
    <div className="mt-5 rounded-2xl bg-zinc-900 p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-semibold">Inventory Cost Check</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Linked to the Materials page inventory.
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            canCraft
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {canCraft ? "Enough Materials" : `${missingCount} Missing`}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((item) => (
          <div
            key={item.name}
            className={`rounded-xl p-3 ring-1 ${
              item.enough
                ? "bg-green-500/10 ring-green-500/20"
                : "bg-red-500/10 ring-red-500/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{item.name}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  item.enough
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {item.enough ? "OK" : "Missing"}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-zinc-300">
              <p>Required: {formatNumber(item.required)}</p>
              <p>Owned: {formatNumber(item.owned)}</p>
              <p className={item.enough ? "text-green-300" : "text-red-300"}>
                Missing: {formatNumber(item.missing)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
