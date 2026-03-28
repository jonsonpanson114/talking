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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

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

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const handler = () => {
      setPermission(Notification.permission);
    };

    const interval = setInterval(() => {
      if (Notification.permission !== permission) {
        handler();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [permission]);

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
              enabled: updatedSettings.enabled,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to sync settings with server:", error);
      }
    }
  }, [permission]);

  const requestNotificationPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);

    const updated = { ...settings, permission: result };
    setSettings(updated);
    saveNotificationSettings(updated);

    if (result === "granted") {
      await syncNotificationSettings(updated);
    }

    return result;
  }, [settings]);

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
      syncWithServer(updated);
    },
    [settings, syncWithServer]
  );

  const toggleEnabled = useCallback(
    (enabled: boolean) => {
      const updated = { ...settings, enabled };
      setSettings(updated);
      saveNotificationSettings(updated);
      syncNotificationSettings(updated);
      syncWithServer(updated);
    },
    [settings, syncWithServer]
  );

  const dismissPrompt = useCallback(() => {
    const updated = { ...settings, hasDismissedPrompt: true };
    setSettings(updated);
    saveNotificationSettings(updated);
  }, [settings]);

  const registerPushSubscription = useCallback(async () => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      permission !== "granted"
    ) {
      return false;
    }

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
      console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as unknown as BufferSource,
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          settings: {
            hour: settings.hour,
            minute: settings.minute,
            enabled: settings.enabled,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register subscription on server");
      }

      savePushSubscription(subscription);
      return true;
    } catch (error) {
      console.error("Failed to register push subscription:", error);
      return false;
    }
  }, [permission, settings]);

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
