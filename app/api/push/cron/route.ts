import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSubscriptionsToNotify, deleteSubscription } from "@/lib/kv";

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

    // 現在時刻（JST）を取得
    const now = new Date();
    // Vercel ServerはUTCなので、JSTに変換 (UTC+9)
    const jstOffset = 9 * 60;
    const jstDate = new Date(now.getTime() + (jstOffset * 60 * 1000));
    const currentHour = jstDate.getUTCHours();
    const currentMinute = jstDate.getUTCMinutes();

    console.log(`Executing Cron Job at JST: ${currentHour}:${currentMinute}`);

    // DBから通知対象のユーザーを取得
    const subscriptions = await getSubscriptionsToNotify(currentHour, currentMinute);

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to notify at this time",
        currentTimeJST: `${currentHour}:${currentMinute}`,
      });
    }

    const results = {
      total: subscriptions.length,
      success: 0,
      failed: 0,
      deleted: 0,
    };

    // 並列で通知を送信
    const sendPromises = subscriptions.map(async (data) => {
      try {
        await webpush.sendNotification(
          data.subscription,
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
        // ステータスコード410（Gone）または404（Not Found）は、購読が失効している
        if (error.statusCode === 410 || error.statusCode === 404) {
          await deleteSubscription(data.subscription.endpoint);
          results.deleted++;
        }
        results.failed++;
        console.error(`Failed to send push to ${data.subscription.endpoint}:`, error.message);
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({
      success: true,
      results,
      timestamp: jstDate.toISOString(),
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
    currentTimeUTC: new Date().toISOString(),
  });
}
