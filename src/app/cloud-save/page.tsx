"use client";

import { useEffect, useState } from "react";

import { collectLocalSaveData, restoreLocalSaveData } from "@/lib/saveKeys";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import RealtimeSyncPanel from "@/components/RealtimeSyncPanel";

export default function CloudSavePage() {
  const [email, setEmail] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const supabase = createBrowserSupabaseClient();

      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setSignedInEmail(data.user.email);
          loadCloudSaveMeta();
        }
      });
    } catch {
      setStatus("Supabase is not configured yet.");
    }
  }, []);

  async function loadCloudSaveMeta() {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const { data } = await supabase
        .from("user_saves")
        .select("updated_at")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (data?.updated_at) {
        setLastSavedAt(data.updated_at);
      }
    } catch {
      // ignore metadata failures
    }
  }

  async function sendMagicLink() {
    setStatus("Sending magic link...");

    try {
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
  emailRedirectTo:
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/cloud-save",
},
      });

      if (error) throw error;

      setStatus("Magic link sent. Check your email.");
    } catch (error) {
      console.error(error);
      setStatus("Could not send magic link. Check Supabase setup.");
    }
  }

  async function refreshSession() {
    const supabase = createBrowserSupabaseClient();

    const { data } = await supabase.auth.getUser();

    if (data.user?.email) {
      setSignedInEmail(data.user.email);
      setStatus("Signed in.");
      await loadCloudSaveMeta();
    } else {
      setStatus("Not signed in yet. Open the magic link from your email.");
    }
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();

    setSignedInEmail("");
    setLastSavedAt("");
    setStatus("Signed out.");
  }

  async function uploadCloudSave() {
    setStatus("Uploading cloud save...");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setStatus("Sign in first.");
        return;
      }

      const saveData = collectLocalSaveData();
      const updatedAt = new Date().toISOString();

      const { error } = await supabase.from("user_saves").upsert({
        user_id: userData.user.id,
        save_data: saveData,
        updated_at: updatedAt,
      });

      if (error) throw error;

      setLastSavedAt(updatedAt);
      setStatus("Cloud save uploaded.");
    } catch (error) {
      console.error(error);
      setStatus("Cloud save upload failed.");
    }
  }

  async function downloadCloudSave() {
    const confirmed = window.confirm(
      "Download cloud save and overwrite this device's local data?"
    );

    if (!confirmed) return;

    setStatus("Downloading cloud save...");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setStatus("Sign in first.");
        return;
      }

      const { data, error } = await supabase
        .from("user_saves")
        .select("save_data, updated_at")
        .eq("user_id", userData.user.id)
        .single();

      if (error) throw error;

      restoreLocalSaveData(data.save_data);

      if (data.updated_at) {
        setLastSavedAt(data.updated_at);
      }

      setStatus("Cloud save restored. Refresh the app.");
    } catch (error) {
      console.error(error);
      setStatus("Cloud save download failed.");
    }
  }

  async function signInWithGoogle() {
  setStatus("Opening Google sign in...");

  try {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000/cloud-save",
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error(error);
    setStatus("Could not start Google sign in.");
  }
}

  return (
    <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Cloud Save</h1>
        <p className="mt-2 text-zinc-400">
          Sync your tracker save across devices using Supabase.
        </p>
      </div>

      <section className="rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        {signedInEmail ? (
          <div>
            <p className="text-zinc-300">Signed in as:</p>
            <p className="mt-1 font-semibold">{signedInEmail}</p>

            {lastSavedAt && (
              <p className="mt-2 text-sm text-zinc-500">
                Last cloud save: {new Date(lastSavedAt).toLocaleString()}
              </p>
            )}

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={uploadCloudSave}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Upload Save
              </button>

              <button
                type="button"
                onClick={downloadCloudSave}
                className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
              >
                Download Save
              </button>

              <button
                type="button"
                onClick={signOut}
                className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-zinc-800 p-3 text-white outline-none"
            />

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={sendMagicLink}
                className="rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Send Magic Link
              </button>

              <button
                type="button"
                onClick={refreshSession}
                className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
              >
                I Opened The Link
              </button>

              <button
  type="button"
  onClick={signInWithGoogle}
  className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white hover:bg-zinc-700"
>
  Continue with Google
</button>
            </div>
          </div>
        )}

        {status && (
          <p className="mt-5 rounded-xl bg-zinc-800 p-4 text-sm text-zinc-300">
            {status}
          </p>
        )}
      </section>

        <section className="mt-6">
  <RealtimeSyncPanel />
</section>

      <section className="mt-6 rounded-2xl bg-zinc-900 p-5 shadow-lg ring-1 ring-zinc-800">
        <h2 className="text-2xl font-bold">How to use</h2>

        <ol className="mt-4 list-decimal space-y-2 pl-6 text-zinc-300">
          <li>Sign in with your email magic link.</li>
          <li>Press Upload Save to back up this device.</li>
          <li>On another device, sign in and press Download Save.</li>
          <li>Refresh the app after downloading.</li>
        </ol>
      </section>
    </main>
  );
}
