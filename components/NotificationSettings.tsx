"use client";

import { useState } from "react";
import { Bell, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationSettings() {
  const {
    settings,
    permission,
    requestPermission,
    updateNotificationTime,
    toggleEnabled,
    registerPushSubscription,
    unregisterPushSubscription,
    isPushSubscriptionRegistered,
    isSupported,
  } = useNotifications();

  const [isRegistering, setIsRegistering] = useState(false);
  const [pushStatus, setPushStatus] = useState<"idle" | "success" | "error">("idle");

  if (!isSupported) {
    return (
      <div className="glass-card p-6">
        <p className="text-sm text-white/30">
          お使いのブラウザは通知機能をサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* オンオフ切り替え */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">通知設定</h4>
          <p className="text-xs text-white/30">毎日の練習リマインダー</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* 詳細設定（有効時のみ表示） */}
      {settings.enabled && (
        <div className="space-y-4">
          {/* 許可状態 */}
          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="w-full glass-card p-4 text-left hover:bg-white/5 transition-colors"
            >
              <p className="text-sm font-medium mb-1">通知を許可する</p>
              <p className="text-xs text-white/30">
                ブラウザの通知許可が必要です
              </p>
            </button>
          )}

          {permission === "granted" && (
            <>
              <div className="flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>通知が許可されています</span>
              </div>

              {/* Push Subscription登録状態 */}
              {!isPushSubscriptionRegistered() ? (
                <button
                  onClick={async () => {
                    setIsRegistering(true);
                    setPushStatus("idle");
                    const success = await registerPushSubscription();
                    setPushStatus(success ? "success" : "error");
                    setIsRegistering(false);
                  }}
                  disabled={isRegistering}
                  className="w-full glass-card p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {pushStatus === "success"
                          ? "✓ Web Pushを登録しました"
                          : pushStatus === "error"
                          ? "✗ 登録に失敗しました"
                          : "バックグラウンド通知を有効にする"}
                      </p>
                      <p className="text-xs text-white/30">
                        アプリを閉じていても通知が届くようになります
                      </p>
                    </div>
                    {isRegistering && (
                      <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                    )}
                  </div>
                </button>
              ) : (
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        ✓ バックグラウンド通知が有効
                      </p>
                      <p className="text-xs text-white/30">
                        アプリを閉じていても通知が届きます
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {permission === "denied" && (
            <div className="flex items-start gap-2 text-red-400 text-xs">
              <XCircle className="w-4 h-4 mt-0.5" />
              <span>
                通知がブロックされています。ブラウザ設定から変更してください。
              </span>
            </div>
          )}

          {/* 時間設定 */}
          {permission === "granted" && (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/40">
                通知時間
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={settings.hour}
                    onChange={(e) =>
                      updateNotificationTime(
                        parseInt(e.target.value) || 0,
                        settings.minute
                      )
                    }
                    className="w-full bg-transparent text-center text-2xl font-semibold"
                  />
                  <p className="text-xs text-white/20 text-center mt-1">時</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={settings.minute}
                    onChange={(e) =>
                      updateNotificationTime(
                        settings.hour,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full bg-transparent text-center text-2xl font-semibold"
                  />
                  <p className="text-xs text-white/20 text-center mt-1">分</p>
                </div>
              </div>
              <p className="text-xs text-white/20 text-center">
                毎日この時間に通知をお送りします
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
