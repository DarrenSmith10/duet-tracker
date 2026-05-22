"use client";

import { useRealtimeSaveSync } from "@/hooks/useRealtimeSaveSync";

export default function RealtimeSyncPanel() {
  const {
    status,
    isSyncing,
    lastSyncedAt,
    uploadAll,
    downloadAll,
    startRealtimeSync,
    stopRealtimeSync,
  } = useRealtimeSaveSync();

  return (
    <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Realtime Sync</h2>

        <p className="mt-2 text-sm text-zinc-400">
          Sync materials, forge queue, history, daily notes, custom recipes, and recipe overrides across your devices.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <button
          type="button"
          disabled={isSyncing}
          onClick={uploadAll}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
        >
          Upload Local
        </button>

        <button
          type="button"
          disabled={isSyncing}
          onClick={downloadAll}
          className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          Download Cloud
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem("liveSyncEnabled", "true");
            startRealtimeSync();
          }}
          className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-green-400"
        >
          Start Live Sync
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem("liveSyncEnabled", "false");
            stopRealtimeSync();
        }}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
        >
          Stop Live Sync
        </button>
      </div>

      <p className="mt-5 rounded-xl bg-zinc-800 p-4 text-sm text-zinc-300">
        {status}
      </p>

      {lastSyncedAt && (
        <p className="mt-3 text-sm text-zinc-500">
          Last sync: {new Date(lastSyncedAt).toLocaleString()}
        </p>
      )}
    </section>
  );
}
