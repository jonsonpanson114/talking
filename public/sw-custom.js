// Custom Service Worker for Notification Scheduling
// This file extends the auto-generated service worker from next-pwa

let checkInterval = null;
let currentSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
  lastNotificationDate: null,
};

// メッセージ受信時の処理
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "UPDATE_NOTIFICATION_SETTINGS") {
    setupNotificationCheck(event.data.settings);
  }
});

// 通知チェックをセットアップ
function setupNotificationCheck(settings) {
  currentSettings = { ...currentSettings, ...settings };

  // 既存のインターバルをクリア
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // 通知が無効な場合は何もしない
  if (!currentSettings.enabled) {
    return;
  }

  // 60秒ごとにチェック
  checkInterval = setInterval(() => {
    checkAndSendNotification();
  }, 60000);
}

// 通知時間をチェックして送信
async function checkAndSendNotification() {
  if (!currentSettings.enabled) {
    return;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 通知時間に一致するかチェック
  if (currentHour === currentSettings.hour && currentMinute === currentSettings.minute) {
    const today = now.toDateString();

    // 今日既に通知済みかチェック
    if (currentSettings.lastNotificationDate !== today) {
      await sendNotification();
      currentSettings.lastNotificationDate = today;

      // クライアントに更新を通知
      notifyClients(currentSettings);
    }
  }
}

// 通知を送信
async function sendNotification() {
  try {
    await self.registration.showNotification("Talking - 練習の時間です！", {
      body: "5分間の会話練習で、今日もスキルアップしましょう。",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "practice-reminder",
      requireInteraction: true,
      data: {
        url: "/roleplay",
      },
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

// クライアントに設定更新を通知
function notifyClients(settings) {
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "NOTIFICATION_SENT",
        settings,
      });
    });
  });
}

// 通知クリックイベント
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(url).catch((error) => {
      console.error("Failed to open window:", error);
    })
  );
});

// Pushイベント受信
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || "Talking";
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/icon-192.png",
      tag: data.tag || "push-notification",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    // JSONパースエラーの場合はテキストとして処理
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Talking", {
        body: text,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    );
  }
});

// Service Workerインストール時に設定を復元
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // クライアントから設定をリクエスト
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => {
        client.postMessage({
          type: "REQUEST_NOTIFICATION_SETTINGS",
        });
      });
    })()
  );
});

console.log("Custom Service Worker for notifications loaded");
