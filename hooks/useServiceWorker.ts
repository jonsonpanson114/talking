import { useEffect } from "react";

export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    // カスタムService Workerを登録
    navigator.serviceWorker
      .register("/sw-custom.js")
      .then((registration) => {
        console.log("Custom Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("Custom Service Worker registration failed:", error);
      });

    // Service Workerからのメッセージをリッスン
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "REQUEST_NOTIFICATION_SETTINGS") {
        // Service Workerから設定リクエストが来た場合、現在の設定を送信
        const { loadNotificationSettings } = require("@/lib/storage");
        const settings = loadNotificationSettings();
        event.ports[0].postMessage({
          type: "NOTIFICATION_SETTINGS",
          settings,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);
}
