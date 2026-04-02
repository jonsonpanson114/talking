// Custom Service Worker for Push Notifications
// This file handles background push notifications from the server

// 通知クリックイベントの処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // 通知データに含まれるURLを取得、なければトップページ
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 既に開いているウィンドウがあればそこにフォーカス
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // なければ新しく開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Pushイベント受信時の処理
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event received but no data");
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    // JSONでない場合はテキストとして扱う
    data = {
      title: "Talking",
      body: event.data.text(),
    };
  }

  const title = data.title || "Talking";
  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "practice-reminder",
    requireInteraction: data.requireInteraction || false,
    renotify: true, // 同じURL/タグでも再度通知
    vibrate: [200, 100, 200], // Androidでの視認性向上
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Service Workerのアクティベート
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

console.log("Talking Push Service Worker loaded");
