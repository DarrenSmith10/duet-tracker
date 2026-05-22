import { NextResponse } from "next/server";

import { sendPushToAllSubscriptions } from "@/lib/push/sendPush";
import {
  getDueScheduledNotifications,
  markScheduledNotificationSent,
} from "@/lib/push/scheduler";

export const dynamic = "force-dynamic";

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueNotifications = await getDueScheduledNotifications(100);

    let sent = 0;
    let failed = 0;

    const processed: Array<{
      id: string;
      type: string;
      title: string;
      notify_at: string;
      status: "sent" | "failed";
      error?: string;
    }> = [];

    for (const notification of dueNotifications) {
      try {
        const result = await sendPushToAllSubscriptions({
          title: notification.title,
          body: notification.body,
          url: notification.url,
        });

        sent += result.sent;
        failed += result.failed;

        await markScheduledNotificationSent(notification.id);

        processed.push({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          notify_at: notification.notify_at,
          status: "sent",
        });
      } catch (error) {
        console.error("Failed notification", notification.id, error);
        failed += 1;

        processed.push({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          notify_at: notification.notify_at,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      due: dueNotifications.length,
      sent,
      failed,
      processed,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Cron notification check failed.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
