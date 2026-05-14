import { NextResponse } from "next/server";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    const endpoint = subscription.endpoint;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing subscription endpoint." },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    const { error } = await supabase.from("push_subscriptions").upsert({
      endpoint,
      subscription,
      updated_at: new Date().toISOString(),
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
    console.error(error);

    return NextResponse.json(
      { error: "Could not save push subscription." },
      { status: 500 }
    );
  }
}
