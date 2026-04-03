import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

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
  try {
    const { subscription, settings } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // GASにデータを送信して保存
    const gasUrl = process.env.GAS_WEBHOOK_URL;
    if (gasUrl) {
      try {
        const gasResponse = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "subscribe",
            subscription: JSON.stringify(subscription),
            settings: {
              hour: settings?.hour ?? 20,
              minute: settings?.minute ?? 0,
              enabled: settings?.enabled ?? true,
            },
            userAgent: req.headers.get("user-agent"),
          }),
        });

        if (!gasResponse.ok) {
          console.error("GAS registration failed:", await gasResponse.text());
        } else {
          console.log("Subscription synced to GAS successfully");
        }
      } catch (gasError) {
        console.error("Error connecting to GAS:", gasError);
      }
    } else {
      console.warn("GAS_WEBHOOK_URL is not configured. Subscription was not saved to GAS.");
    }

    // 初回の確認通知を送る
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
          },
        })
      );
    } catch (pushError) {
      console.error("Failed to send initial test notification:", pushError);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription registered and synced to GAS",
    });
  } catch (error) {
    console.error("Push subscription API error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
