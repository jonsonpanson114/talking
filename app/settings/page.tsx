"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Send } from "lucide-react";
import { NotificationSettings } from "@/components/NotificationSettings";
import { clearPushSubscription, savePushSubscription } from "@/lib/storage";
import { useNotifications } from "@/hooks/useNotifications";

export default function SettingsPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { permission, registerPushSubscription } = useNotifications();

  const getCurrentSubscription = async () => {
    if (!("serviceWorker" in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  };

  const sendTestNotification = async () => {
    setIsSending(true);
    setTestResult(null);

    try {
      if (permission !== "granted") {
        setTestResult("✗ 通知許可が必要です。先に通知を許可してください。");
        return;
      }

      let subscription = await getCurrentSubscription();

      // 古い購読情報で失敗しないよう、最新購読を必ず取得/再登録
      if (!subscription) {
        const registered = await registerPushSubscription();
        if (!registered) {
          setTestResult("✗ バックグラウンド通知の登録に失敗しました。再度有効化してください。");
          return;
        }
        subscription = await getCurrentSubscription();
      }

      if (!subscription) {
        setTestResult("✗ 購読情報を取得できませんでした。");
        return;
      }

      // 最新のsubscriptionをローカルにも同期
      savePushSubscription(subscription);

      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          data: {
            title: "Talking - テスト通知",
            body: "これはテスト通知です。Web Pushが正常に動作しています。",
            url: "/settings",
          },
        }),
      });

      if (response.ok) {
        setTestResult("✓ テスト通知を送信しました");
        return;
      }

      const errorJson = await response.json().catch(() => null);
      const code = errorJson?.code;
      const detail = errorJson?.detail;

      if (code === "EXPIRED") {
        clearPushSubscription();
        const reRegistered = await registerPushSubscription(true);
        if (!reRegistered) {
          setTestResult("✗ 購読期限切れ。再登録に失敗しました。通知を一度OFF/ONしてください。");
          return;
        }

        const retriedSub = await getCurrentSubscription();
        if (!retriedSub) {
          setTestResult("✗ 再登録後の購読情報取得に失敗しました。");
          return;
        }

        savePushSubscription(retriedSub);

        const retryResponse = await fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: retriedSub.toJSON(),
            data: {
              title: "Talking - テスト通知",
              body: "購読を再登録して再送しました。",
              url: "/settings",
            },
          }),
        });

        if (retryResponse.ok) {
          setTestResult("✓ 購読を再登録してテスト通知を送信しました");
          return;
        }
      }

      setTestResult(`✗ 通知の送信に失敗しました${detail ? ` (${detail})` : ""}`);
    } catch (error) {
      console.error(error);
      setTestResult("✗ エラーが発生しました。時間をおいて再試行してください。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />

      <header className="relative pt-8 pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">ホームに戻る</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">設定</h1>
          </div>
        </div>
      </header>

      <main className="px-6 pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">通知</h2>
            <div className="glass-card p-6">
              <NotificationSettings />

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={sendTestNotification}
                  disabled={isSending}
                  className="w-full glass-card p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">テスト通知を送信</p>
                      <p className="text-xs text-white/30">通知が正常に動作しているか確認できます</p>
                    </div>
                    <Send className="w-4 h-4 text-white/60" />
                  </div>
                </button>

                {testResult && (
                  <div className={`mt-3 text-xs ${testResult.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">データ管理</h2>
            <div className="glass-card p-6">
              <p className="text-sm text-white/30">
                進捗データのリセット機能は、今後のアップデートで追加予定です。
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
