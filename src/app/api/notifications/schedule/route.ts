import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    const supabase = createServiceSupabaseClient();

    const { error } = await supabase.from("scheduled_notifications").insert({
      notification_key: input.notificationKey ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      url: input.url ?? "/",
      notify_at: input.notifyAt,
      sent_at: null,
    });

    if (error) {
      return NextResponse.json(
        {
          error: "Supabase insert failed",
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not schedule notification.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}