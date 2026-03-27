"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Send } from "lucide-react";
import { NotificationSettings } from "@/components/NotificationSettings";
import { loadPushSubscription } from "@/lib/storage";

export default function SettingsPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendTestNotification = async () => {
    const subscription = loadPushSubscription();
    if (!subscription) {
      setTestResult("先にバックグラウンド通知を有効にしてください");
      return;
    }

    setIsSending(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription,
          data: {
            title: "Talking - テスト通知",
            body: "これはテスト通知です。Web Pushが正常に動作しています。",
            url: "/settings",
          },
        }),
      });

      if (response.ok) {
        setTestResult("✓ テスト通知を送信しました");
      } else {
        setTestResult("✗ 通知の送信に失敗しました");
      }
    } catch (error) {
      setTestResult("✗ エラーが発生しました");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />

      {/* ヘッダー */}
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

      {/* 設定セクション */}
      <main className="px-6 pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 通知設定 */}
          <section>
            <h2 className="text-lg font-semibold mb-4">通知</h2>
            <div className="glass-card p-6">
              <NotificationSettings />

              {/* テスト通知ボタン */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={sendTestNotification}
                  disabled={isSending}
                  className="w-full glass-card p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">テスト通知を送信</p>
                      <p className="text-xs text-white/30">
                        通知が正常に動作しているか確認できます
                      </p>
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

          {/* データ管理（将来用） */}
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
