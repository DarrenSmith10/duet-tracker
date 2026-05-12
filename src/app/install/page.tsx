export default function InstallPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Install App</h1>
        <p className="mt-2 text-zinc-400">
          Add My DNA Companion Tracker to your iPhone or iPad Home Screen.
        </p>
      </div>

      <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg">
        <h2 className="text-2xl font-bold">iPhone / iPad Safari</h2>

        <ol className="mt-4 list-decimal space-y-3 pl-6 text-zinc-300">
          <li>Open the deployed app in Safari.</li>
          <li>Tap the Share button.</li>
          <li>Tap Add to Home Screen.</li>
          <li>Confirm the name: My DNA Companion Tracker.</li>
          <li>Tap Add.</li>
        </ol>

        <p className="mt-5 text-sm text-zinc-500">
          iOS PWA install works best from HTTPS production URLs, not local LAN addresses.
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-zinc-900 p-5 shadow-lg">
        <h2 className="text-2xl font-bold">Android / Desktop</h2>

        <p className="mt-4 text-zinc-300">
          Open the app in Chrome or Edge and use the install icon in the address bar.
        </p>
      </section>
    </main>
  );
}
