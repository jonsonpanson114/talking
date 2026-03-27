"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

interface NotificationPermissionProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationPermission({
  onEnable,
  onDismiss,
}: NotificationPermissionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 sm:p-6 mb-6"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
            毎日の練習リマインダー
          </h3>
          <p className="text-xs sm:text-sm text-white/30 mb-3 sm:mb-4">
            設定した時間に練習のリマインダー通知をお送りします。
            継続的な練習で会話力を向上させましょう。
          </p>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onEnable}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              通知を有効にする
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
            >
              後で設定
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
