"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_KEYS = [
  "characters",
  "weapons",
  "materials",
  "demonWedges",
  "forgeQueue",
  "dailyTasks",
  "weeklyTasks",
  "quickNotes",
  "pullPlans",
  "farmingGoals",
  "recipeOverrides",
  "customForgeRecipes",
  "commissions",
];

function MenuCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800 transition hover:bg-zinc-800"
    >
      <div className="text-3xl">{icon}</div>
      <h2 className="mt-4 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </Link>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState("");

  function exportSaveData() {
    try {
      const saveData: Record<string, unknown> = {};

      STORAGE_KEYS.forEach((key) => {
        const value = localStorage.getItem(key);

        if (!value) return;

        try {
          saveData[key] = JSON.parse(value);
        } catch {
          saveData[key] = value;
        }
      });

      saveData.exportedAt = new Date().toISOString();
      saveData.version = "1.1.0";

      const blob = new Blob([JSON.stringify(saveData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `my-dna-companion-save-${Date.now()}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setStatus("Save exported successfully.");
    } catch (error) {
      console.error(error);
      setStatus("Failed to export save.");
    }
  }

  async function importSaveData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      STORAGE_KEYS.forEach((key) => {
        if (data[key] === undefined) return;

        if (typeof data[key] === "string") {
          localStorage.setItem(key, data[key]);
        } else {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      });

      setStatus("Save imported successfully. Refresh the app.");
    } catch (error) {
      console.error(error);
      setStatus("Invalid save file.");
    }
  }

  function clearAllData() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all local tracker data?"
    );

    if (!confirmed) return;

    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    setStatus("All local tracker data cleared. Refresh the app.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Menu</h1>
        <p className="mt-2 text-zinc-400">
          Manage saves, app tools, install options, and tracker pages.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MenuCard
          title="Forge Queue"
          description="Open timers, recipes, custom items, and material costs."
          href="/forge-queue"
          icon="⚒️"
        />

        <MenuCard
          title="Daily Notes"
          description="Daily/weekly progress, pull plans, and farming notes."
          href="/daily-notes"
          icon="📝"
        />

        <MenuCard
          title="Materials"
          description="Track owned materials and farming stock."
          href="/materials"
          icon="📦"
        />

        <MenuCard
          title="Demon Wedges"
          description="Open your Demon Wedge collection tracker."
          href="/demon-wedges"
          icon="💠"
        />
      </section>

      <section className="mb-8 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">Save Management</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Back up or restore your local app data. This includes custom forge recipes and recipe overrides.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={exportSaveData}
            className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
          >
            Export Save
          </button>

          <label className="block cursor-pointer rounded-xl bg-zinc-800 px-5 py-3 text-center font-semibold text-white hover:bg-zinc-700">
            Import Save
            <input
              type="file"
              accept=".json"
              onChange={importSaveData}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={clearAllData}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
          >
            Clear Local Data
          </button>
        </div>

        {status && (
          <p className="mt-5 rounded-xl bg-zinc-800 p-4 text-sm text-zinc-300">
            {status}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MenuCard
          title="Install App"
          description="View iPhone/iPad Home Screen install instructions."
          href="/install"
          icon="📱"
        />

        <MenuCard
          title="Notifications"
          description="Open notification settings and future push controls."
          href="/notifications"
          icon="🔔"
        />

        <MenuCard
          title="Cloud Save"
          description="Future Supabase sync and account backup page."
          href="/cloud-save"
          icon="☁️"
        />
      </section>

      <section className="mt-8 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">About</h2>
        <p className="mt-3 text-zinc-400">
          My DNA Companion Tracker is your personal Duet Night Abyss companion app for forge timers, Demon Wedges, recipes, materials, daily notes, and mobile PWA tracking.
        </p>
      </section>
    </main>
  );
}
