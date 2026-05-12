# Optional Forge Queue push integration

Your current local notifications already run when a forge finishes.

To also send a server push when a forge completes, find this block in `src/app/forge-queue/page.tsx`:

```tsx
finishedUnnotified.forEach((item) => {
  sendForgeCompleteNotification(item.itemName);
});
```

Replace with:

```tsx
finishedUnnotified.forEach((item) => {
  sendForgeCompleteNotification(item.itemName);

  fetch("/api/push/send-forge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Forge Complete",
      body: `${item.itemName} is ready to claim.`,
      url: "/forge-queue",
    }),
  }).catch(() => {
    // keep local notification working even if push fails
  });
});
```

Note:
This sends to all stored push subscriptions in your app.
Later, when user accounts are fully connected to push subscriptions, this can be changed to send only to the signed-in user.
