const CACHE_NAME = "dna-tracker-v6";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const assets = [
        "/",
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/apple-touch-icon.png",
      ];

      await Promise.allSettled(
        assets.map((asset) =>
          cache.add(asset).catch(() => {
            console.warn("Could not cache:", asset);
          })
        )
      );
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "DNA Tracker",
    body: "You have a new notification.",
    url: "/",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "DNA Tracker", {
      body: data.body || "Notification",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: {
        url: data.url || "/",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })
  );
});