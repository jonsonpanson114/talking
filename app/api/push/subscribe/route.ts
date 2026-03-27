import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

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
    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // Push Subscriptionを検証（テスト送信）
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Talking - 通知が有効になりました",
          body: "毎日の練習リマインダーをお送りします。",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          type: "test",
        })
      );
    } catch (error) {
      console.error("Failed to send test notification:", error);
      // テスト失敗は無視して続行
    }

    return NextResponse.json({
      success: true,
      message: "Subscription registered successfully",
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to register subscription" },
      { status: 500 }
    );
  }
}
