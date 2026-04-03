import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// VAPID設定
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    publicKey,
    privateKey
  );
} else {
  console.warn("VAPID keys are not configured. Web Push will not work.");
}

export async function POST(req: NextRequest) {
  let subscriptionData: any = null;
  try {
    const body = await req.json();
    subscriptionData = body.subscription;
    const data = body.data;

    if (!subscriptionData || !subscriptionData.endpoint) {
      return NextResponse.json(
        { error: "Subscription is required" },
        { status: 400 }
      );
    }

    // 通知送信
    await webpush.sendNotification(
      subscriptionData,
      JSON.stringify({
        title: data?.title || "Talking - 練習の時間です！",
        body: data?.body || "5分間の会話練習で、今日もスキルアップしましょう。",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "practice-reminder",
        requireInteraction: true,
        data: {
          url: data?.url || "/roleplay",
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push send error:", error);

    // Subscriptionが無効な場合
    if ((error.statusCode === 410 || error.statusCode === 404) && subscriptionData?.endpoint) {
      // GAS側で削除されるはずだが、Vercel側でも期限切れを通知
      return NextResponse.json(
        { error: "Subscription has expired", code: "EXPIRED" },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// GETリクエストでテスト通知を送信（開発用）
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const subscriptionData = searchParams.get("subscription");

    if (!subscriptionData) {
      return NextResponse.json(
        { error: "Subscription query parameter is required" },
        { status: 400 }
      );
    }

    const subscription = JSON.parse(subscriptionData);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Talking - テスト通知",
        body: "これはテスト通知です。Web Pushが正常に動作しています。",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test-notification",
      })
    );

    return NextResponse.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    console.error("Test push send error:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
