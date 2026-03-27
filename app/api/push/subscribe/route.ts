import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { saveSubscription } from "@/lib/kv";

// VAPID設定
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // 任意のメールアドレス
    publicKey,
    privateKey
  );
} else {
  console.warn("VAPID keys are not configured. Web Push will not work.");
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, settings } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // Vercel KVに保存（永続化）
    try {
      await saveSubscription(subscription, settings || {});
      console.log("Subscription saved to KV:", subscription.endpoint);
    } catch (kvError) {
      console.error("Failed to save subscription to KV:", kvError);
      // KV保存に失敗しても、通知自体は送れる可能性があるので続行するが警告
    }

    // Push Subscriptionを検証（テスト送信）
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Talking - 通知が有効になりました",
          body: "あなたの生活リズムに合わせて、最適なタイミングでリマインダーをお送りします。",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          type: "test",
          data: {
            url: "/",
          }
        })
      );
    } catch (pushError) {
      console.error("Failed to send initial test notification:", pushError);
      // テスト送信失敗は、ブラウザ側での登録には成功しているため400エラーにはしない
    }

    return NextResponse.json({
      success: true,
      message: "Subscription registered and saved successfully",
    });
  } catch (error) {
    console.error("Push subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
