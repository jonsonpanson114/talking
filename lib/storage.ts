import { UserProgress, NotificationSettings } from "@/lib/types";

const STORAGE_KEY = "talking-user-progress";

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

export function loadProgress(): UserProgress {
  const defaultProgress: UserProgress = {
    answeredQuestions: {},
    favorites: [],
    lastViewed: {},
  };

  if (typeof window === "undefined") return defaultProgress;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load progress:", error);
  }
  return defaultProgress;
}

export function saveAnswer(questionId: string, answer: string): void {
  const progress = loadProgress();
  progress.answeredQuestions[questionId] = answer;
  saveProgress(progress);
}

export function loadAnswer(questionId: string): string | undefined {
  const progress = loadProgress();
  return progress.answeredQuestions[questionId];
}

export function toggleFavorite(questionId: string): void {
  const progress = loadProgress();
  const index = progress.favorites.indexOf(questionId);
  if (index === -1) {
    progress.favorites.push(questionId);
  } else {
    progress.favorites.splice(index, 1);
  }
  saveProgress(progress);
}

export function isFavorite(questionId: string): boolean {
  const progress = loadProgress();
  return progress.favorites.includes(questionId);
}

export function saveLastViewed(category: string): void {
  const progress = loadProgress();
  progress.lastViewed[category] = new Date();
  saveProgress(progress);
}

export function loadLastViewed(category: string): Date | undefined {
  const progress = loadProgress();
  return progress.lastViewed[category];
}

// 通知設定関連
const NOTIFICATION_SETTINGS_KEY = "talking-notification-settings";

const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
  permission: typeof Notification !== "undefined" ? Notification.permission : "default",
};

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
}

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return defaultNotificationSettings;

  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...defaultNotificationSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load notification settings:", error);
  }
  return defaultNotificationSettings;
}

export function updateNotificationTime(hour: number, minute: number): void {
  const settings = loadNotificationSettings();
  settings.hour = Math.max(0, Math.min(23, hour));
  settings.minute = Math.max(0, Math.min(59, minute));
  saveNotificationSettings(settings);
}

export function toggleNotificationEnabled(enabled: boolean): void {
  const settings = loadNotificationSettings();
  settings.enabled = enabled;
  saveNotificationSettings(settings);
}

// Push Subscription管理
export function savePushSubscription(subscription: PushSubscription): void {
  const settings = loadNotificationSettings();
  const json = subscription.toJSON();
  settings.pushSubscription = {
    endpoint: json.endpoint || "",
    keys: {
      p256dh: json.keys?.p256dh || "",
      auth: json.keys?.auth || "",
    },
    expirationTime: json.expirationTime,
  };
  saveNotificationSettings(settings);
}

export function loadPushSubscription(): PushSubscriptionJSON | null {
  const settings = loadNotificationSettings();
  if (!settings.pushSubscription) {
    return null;
  }
  return settings.pushSubscription;
}

export function clearPushSubscription(): void {
  const settings = loadNotificationSettings();
  settings.pushSubscription = undefined;
  saveNotificationSettings(settings);
}
