import { NextResponse } from "next/server";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { scheduleNotification } from "@/lib/push/scheduler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      notificationKey,
      type,
      title,
      body: messageBody,
      url,
      notifyAt,
    } = body;

    if (!type || !title || !messageBody || !notifyAt) {
      return NextResponse.json(
        { error: "Missing required notification fields." },
        { status: 400 }
      );
    }

    await scheduleNotification({
      userId: userId ?? null,
      notificationKey: notificationKey ?? null,
      type,
      title,
      body: messageBody,
      url: url ?? "/",
      notifyAt,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not schedule notification." },
      { status: 500 }
    );
  }
}
