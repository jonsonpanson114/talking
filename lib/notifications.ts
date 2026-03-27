import { NotificationSettings } from "@/lib/types";
import { loadNotificationSettings } from "@/lib/storage";

/**
 * Notification APIがサポートされているかチェック
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * 通知許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  const result = await Notification.requestPermission();
  return result;
}

/**
 * 次回通知時刻を計算
 */
export function getNextNotificationTime(settings: NotificationSettings): Date | null {
  if (!settings.enabled) {
    return null;
  }

  const now = new Date();
  const next = new Date();
  next.setHours(settings.hour, settings.minute, 0, 0);

  // 今日の時間が過ぎている場合は翌日に設定
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Service Workerに通知設定を同期
 */
export async function syncNotificationSettings(settings: NotificationSettings): Promise<void> {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: "UPDATE_NOTIFICATION_SETTINGS",
          settings,
        });
      }
    } catch (error) {
      console.error("Failed to sync notification settings to Service Worker:", error);
    }
  }
}

/**
 * 手動で通知を送信（テスト用）
 */
export function sendTestNotification(): boolean {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    new Notification("Talking - テスト通知", {
      body: "これはテスト通知です。通知機能が正常に動作しています。",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "test-notification",
    });
    return true;
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return false;
  }
}
