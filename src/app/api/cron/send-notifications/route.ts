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
    const dueNotifications = await getDueScheduledNotifications(50);

    let sent = 0;
    let failed = 0;

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
      } catch (error) {
        console.error("Failed notification", notification.id, error);
        failed += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      due: dueNotifications.length,
      sent,
      failed,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Cron notification check failed." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
