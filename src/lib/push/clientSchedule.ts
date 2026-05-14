export type ClientScheduleNotificationInput = {
  notificationKey?: string;
  type: string;
  title: string;
  body: string;
  url?: string;
  notifyAt: string;
};

export async function scheduleClientNotification(
  input: ClientScheduleNotificationInput
) {
  const response = await fetch("/api/notifications/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Could not schedule notification.");
  }

  return response.json();
}

export function getForgeNotificationKey(queueItemId: string) {
  return `forge-${queueItemId}`;
}

export function getResetNotificationKey(resetId: string, nextResetIso: string) {
  return `reset-${resetId}-${nextResetIso}`;
}
