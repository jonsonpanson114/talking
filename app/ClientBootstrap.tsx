"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";

export function ClientBootstrap() {
  // 全ページでService Worker登録を試行する
  useServiceWorker();
  return null;
}
