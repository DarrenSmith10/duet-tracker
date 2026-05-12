export function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission() {
  if (!canUseNotifications()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return await Notification.requestPermission();
}

export function sendForgeCompleteNotification(itemName: string) {
  if (!canUseNotifications()) return;
  if (Notification.permission !== "granted") return;

  new Notification("Forge complete", {
    body: `${itemName} is ready to claim.`,
  });
}
