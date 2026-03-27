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

// Cron Job secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    // 認証
    const authHeader = req.headers.get("authorization");
    const secret = req.headers.get("x-cron-secret");

    if ((authHeader !== `Bearer ${CRON_SECRET}`) && (secret !== CRON_SECRET)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 現在時刻を取得
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 通知対象のユーザーを取得（本来はDBから）
    // この実装では、リクエストボディで送信対象のSubscriptionを受け取る
    const { subscriptions } = await req.json();

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { error: "Subscriptions array is required" },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      expired: [] as string[],
    };

    // 並列で通知を送信
    const sendPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          sub,
          JSON.stringify({
            title: "Talking - 練習の時間です！",
            body: "5分間の会話練習で、今日もスキルアップしましょう。",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "practice-reminder",
            requireInteraction: true,
            data: {
              url: "/roleplay",
            },
          })
        );
        results.success++;
      } catch (error: any) {
        if (error.statusCode === 410) {
          results.expired.push(sub.endpoint);
        }
        results.failed++;
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to execute cron job" },
      { status: 500 }
    );
  }
}

// GET for manual testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Cron endpoint is ready",
    usage: "POST with x-cron-secret header or authorization bearer token",
    currentTime: new Date().toISOString(),
  });
}
