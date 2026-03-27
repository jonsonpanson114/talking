import { kv } from "@vercel/kv";
import { NotificationSettings, PushSubscriptionJSON } from "./types";

const SUBS_KEY = "push_subscriptions";

export interface SubscriptionData {
  subscription: PushSubscriptionJSON;
  settings: {
    hour: number;
    minute: number;
    enabled: boolean;
    lastUpdated: string;
  };
}

/**
 * 送信者（Subscription）を保存する
 */
export async function saveSubscription(
  subscription: PushSubscriptionJSON,
  settings: Partial<NotificationSettings>
) {
  const endpoint = subscription.endpoint;
  const data: SubscriptionData = {
    subscription,
    settings: {
      hour: settings.hour ?? 20,
      minute: settings.minute ?? 0,
      enabled: settings.enabled ?? true,
      lastUpdated: new Date().toISOString(),
    },
  };
  
  // 個別のデータを保存
  await kv.set(`sub:${endpoint}`, data);
  // 全体リストに追加
  await kv.sadd(SUBS_KEY, endpoint);
}

/**
 * 全ての送信対象を取得する
 */
export async function getAllSubscriptions(): Promise<SubscriptionData[]> {
  const endpoints = await kv.smembers(SUBS_KEY);
  if (endpoints.length === 0) return [];
  
  // パイプラインで一括取得
  const pipeline = kv.pipeline();
  endpoints.forEach(ep => pipeline.get(`sub:${ep}`));
  const results = await pipeline.exec<SubscriptionData[]>();
  
  // nullを除外して返す
  return results.filter((item): item is SubscriptionData => item !== null);
}

/**
 * 不要になった送信先を削除する
 */
export async function deleteSubscription(endpoint: string) {
  await kv.del(`sub:${endpoint}`);
  await kv.srem(SUBS_KEY, endpoint);
}

/**
 * 指定した時刻に通知すべきユーザーを取得する
 */
export async function getSubscriptionsToNotify(hour: number, minute: number): Promise<SubscriptionData[]> {
  const allSubscripts = await getAllSubscriptions();
  
  return allSubscripts.filter(sub => 
    sub.settings.enabled && 
    sub.settings.hour === hour && 
    sub.settings.minute === minute
  );
}
