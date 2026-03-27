import { useState, useCallback, useEffect } from "react";
import { NotificationSettings } from "@/lib/types";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  savePushSubscription,
  loadPushSubscription,
  clearPushSubscription,
} from "@/lib/storage";
import {
  isNotificationSupported,
  requestNotificationPermission as requestPermission,
  syncNotificationSettings,
} from "@/lib/notifications";

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    loadNotificationSettings()
  );
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof Notification !== "undefined") {
      return Notification.permission;
    }
    return "denied";
  });

  // 許可状態の変更を監視
  useEffect(() => {
    if (!isNotificationSupported()) return;

    const handler = () => {
      setPermission(Notification.permission);
    };

    // Notification.permission の変更を検知
    const interval = setInterval(() => {
      if (Notification.permission !== permission) {
        handler();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [permission]);

  // サーバーに最新の設定を同期する
  const syncWithServer = useCallback(async (updatedSettings: NotificationSettings) => {
    const subscription = loadPushSubscription();
    if (subscription && permission === "granted") {
      try {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            subscription, 
            settings: {
              hour: updatedSettings.hour,
              minute: updatedSettings.minute,
              enabled: updatedSettings.enabled
            }
          }),
        });
      } catch (error) {
        console.error("Failed to sync settings with server:", error);
      }
    }
  }, [permission]);

  // 許可リクエスト（ユーザー操作時のみ呼び出し）
  const requestNotificationPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);

    // 設定を保存
    const updated = { ...settings, permission: result };
    setSettings(updated);
    saveNotificationSettings(updated);

    // 許可された場合、Service Workerに同期
    if (result === "granted") {
      await syncNotificationSettings(updated);
    }

    return result;
  }, [settings]);

  // 時間設定更新
  const updateNotificationTime = useCallback(
    (hour: number, minute: number) => {
      const updated = {
        ...settings,
        hour: Math.max(0, Math.min(23, hour)),
        minute: Math.max(0, Math.min(59, minute)),
      };
      setSettings(updated);
      saveNotificationSettings(updated);
      syncNotificationSettings(updated);
      syncWithServer(updated); // サーバーにも同期
    },
    [settings, syncWithServer]
  );

  // オンオフ切り替え
  const toggleEnabled = useCallback(
    (enabled: boolean) => {
      const updated = { ...settings, enabled };
      setSettings(updated);
      saveNotificationSettings(updated);
      syncNotificationSettings(updated);
      syncWithServer(updated); // サーバーにも同期
    },
    [settings, syncWithServer]
  );

  // 「後で設定」を選択したことを記録
  const dismissPrompt = useCallback(() => {
    const updated = { ...settings, hasDismissedPrompt: true };
    setSettings(updated);
    saveNotificationSettings(updated);
  }, [settings]);

  // Push Subscriptionを登録
  const registerPushSubscription = useCallback(async () => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      permission !== "granted"
    ) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // サーバーに送信して登録（設定も含める）
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscription,
          settings: {
            hour: settings.hour,
            minute: settings.minute,
            enabled: settings.enabled
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register subscription on server");
      }

      // localStorageに保存
      savePushSubscription(subscription);

      return true;
    } catch (error) {
      console.error("Failed to register push subscription:", error);
      return false;
    }
  }, [permission, settings]);

  // Push Subscriptionを解除
  const unregisterPushSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        clearPushSubscription();
      }
      return true;
    } catch (error) {
      console.error("Failed to unregister push subscription:", error);
      return false;
    }
  }, []);

  // 既に登録済みかチェック
  const isPushSubscriptionRegistered = useCallback(() => {
    return !!loadPushSubscription();
  }, []);

  return {
    settings,
    permission,
    requestPermission: requestNotificationPermission,
    updateNotificationTime,
    toggleEnabled,
    dismissPrompt,
    registerPushSubscription,
    unregisterPushSubscription,
    isPushSubscriptionRegistered,
    isSupported: isNotificationSupported(),
  };
}
