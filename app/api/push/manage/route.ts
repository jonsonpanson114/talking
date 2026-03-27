import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "data", "subscriptions.json");

// データディレクトリの初期化
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    execSync(`mkdir -p "${dataDir}"`, { stdio: "ignore" });
  }
}

// Subscriptionsを読み込み
function loadSubscriptions(): any[] {
  try {
    if (existsSync(SUBSCRIPTIONS_FILE)) {
      const data = readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load subscriptions:", error);
  }
  return [];
}

// Subscriptionsを保存
function saveSubscriptions(subscriptions: any[]): void {
  ensureDataDir();
  writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case "register":
        return await handleRegister(data);
      case "unregister":
        return await handleUnregister(data);
      case "list":
        return await handleList();
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Push management error:", error);
    return NextResponse.json({ error: "Failed to manage subscriptions" }, { status: 500 });
  }
}

async function handleRegister(data: {
  subscription: any;
  notificationSettings: any;
}) {
  const { subscription, notificationSettings } = data;
  const subscriptions = loadSubscriptions();

  // 既存チェック
  const existingIndex = subscriptions.findIndex(
    (s) => s.subscription.endpoint === subscription.endpoint
  );

  if (existingIndex >= 0) {
    // 更新
    subscriptions[existingIndex] = {
      subscription,
      notificationSettings,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // 新規登録
    subscriptions.push({
      subscription,
      notificationSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveSubscriptions(subscriptions);

  // Gitコミット（非同期）
  try {
    execSync(
      `cd "${process.cwd()}" && git add data/subscriptions.json && git commit -m "chore: update push subscriptions" && git push`,
      { stdio: "ignore", timeout: 10000 }
    );
  } catch (error) {
    console.warn("Git commit failed:", error);
    // コミット失敗は無視（データは保存されている）
  }

  return NextResponse.json({ success: true });
}

async function handleUnregister(data: { endpoint: string }) {
  const { endpoint } = data;
  let subscriptions = loadSubscriptions();

  const initialLength = subscriptions.length;
  subscriptions = subscriptions.filter((s) => s.subscription.endpoint !== endpoint);

  if (subscriptions.length < initialLength) {
    saveSubscriptions(subscriptions);

    // Gitコミット
    try {
      execSync(
        `cd "${process.cwd()}" && git add data/subscriptions.json && git commit -m "chore: remove push subscription" && git push`,
        { stdio: "ignore", timeout: 10000 }
      );
    } catch (error) {
      console.warn("Git commit failed:", error);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
}

async function handleList() {
  const subscriptions = loadSubscriptions();

  // セキュリティのため、endpointのみを返す
  const safeList = subscriptions.map((s) => ({
    endpoint: s.subscription.endpoint,
    notificationSettings: s.notificationSettings,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return NextResponse.json({ subscriptions: safeList });
}
