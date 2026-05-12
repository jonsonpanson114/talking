"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, Compass, Flame, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { NotificationPermission } from "@/components/NotificationPermission";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocalStorage } from "@/hooks";
import { buildThisOrThatProfile, loadThisOrThatState } from "@/lib/thisOrThatProfile";

type DailyRhythm = {
  streak: number;
  lastOpenedDate: string | null;
};

const DAILY_RHYTHM_KEY = "talking-daily-rhythm";

const roleplayStarts = [
  {
    title: "マッチ直後の初回チャット",
    description: "最初の数往復で、安心感と興味をつくる練習。",
    scenarioId: "matching-app-first-chat",
  },
  {
    title: "日程調整のやり取り",
    description: "押しすぎず、自然に予定を決める練習。",
    scenarioId: "date-scheduling",
  },
  {
    title: "初対面前日のやり取り",
    description: "会う前の緊張を下げて、当日の話題を作る練習。",
    scenarioId: "before-first-date",
  },
];

function getTodayKey() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function getYesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function loadDailyRhythm(): DailyRhythm {
  if (typeof window === "undefined") {
    return { streak: 0, lastOpenedDate: null };
  }

  try {
    const raw = window.localStorage.getItem(DAILY_RHYTHM_KEY);
    if (!raw) return { streak: 0, lastOpenedDate: null };
    const parsed = JSON.parse(raw) as DailyRhythm;
    return {
      streak: Number(parsed.streak || 0),
      lastOpenedDate: parsed.lastOpenedDate || null,
    };
  } catch {
    return { streak: 0, lastOpenedDate: null };
  }
}

function formatReminder(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function HomePage() {
  const { progress } = useLocalStorage();
  const { settings, permission, requestPermission, dismissPrompt, isSupported } = useNotifications();
  const [dailyRhythm, setDailyRhythm] = useState<DailyRhythm>({ streak: 0, lastOpenedDate: null });
  const [profileHint, setProfileHint] = useState<ReturnType<typeof buildThisOrThatProfile> | null>(null);

  useEffect(() => {
    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();
    const current = loadDailyRhythm();

    let next = current;
    if (current.lastOpenedDate !== todayKey) {
      next = {
        streak: current.lastOpenedDate === yesterdayKey ? current.streak + 1 : 1,
        lastOpenedDate: todayKey,
      };

      window.localStorage.setItem(DAILY_RHYTHM_KEY, JSON.stringify(next));
    }

    setDailyRhythm(next);
    const thisOrThatState = loadThisOrThatState();
    setProfileHint(buildThisOrThatProfile(thisOrThatState.history));
  }, []);

  const showNotificationPrompt =
    isSupported &&
    permission === "default" &&
    !settings.enabled &&
    !settings.hasDismissedPrompt;

  const answeredCount = Object.keys(progress.answeredQuestions).length;

  const todayRoleplay = useMemo(() => {
    if (profileHint) {
      const mapped = roleplayStarts.find((item) => item.scenarioId === profileHint.recommendedScenarioId);
      if (mapped) return mapped;
    }

    if (answeredCount >= 8) return roleplayStarts[2];
    if (dailyRhythm.streak >= 3) return roleplayStarts[1];
    return roleplayStarts[0];
  }, [answeredCount, dailyRhythm.streak, profileHint]);

  const quickLinks = [
    {
      title: "自分の傾向を見る",
      description: profileHint ? profileHint.archetype : "This or Thatで会話の傾向を知る",
      href: "/this-or-that",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "話題カード",
      description: "雑談の引き出しを増やす",
      href: "/cards",
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      title: "場面別フレーズ",
      description: "返しに迷う場面から探す",
      href: "/situations",
      icon: <Compass className="w-4 h-4" />,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient" />

      <main className="relative px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto max-w-md space-y-4 sm:max-w-lg">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="ambient-ring rounded-[2rem] border border-white/10 bg-panel p-6 sm:p-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#ffd7b5]/80">
              <TrendingUp className="h-3.5 w-3.5" />
              Roleplay First
            </div>

            <h1 className="mt-5 text-4xl leading-[0.95] sm:text-5xl">
              会う前の会話を、
              <br />
              3分で練習する。
            </h1>

            <p className="mt-4 text-sm leading-7 text-ink-soft">
              今日はロールプレイを1回だけ。まずは本番前に、会話を一度通しておきましょう。
            </p>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">今日のおすすめ</p>
              <h2 className="mt-3 text-2xl leading-tight">{todayRoleplay.title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{todayRoleplay.description}</p>

              <Link
                href={`/roleplay?scenario=${todayRoleplay.scenarioId}`}
                className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 py-4 text-[11px] uppercase tracking-widest"
              >
                今すぐ始める
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-3 text-center text-xs text-white/35">今日はこの1回だけでOK</p>
            </div>
          </motion.section>

          {showNotificationPrompt && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <NotificationPermission onEnable={requestPermission} onDismiss={dismissPrompt} />
            </motion.div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06 }}
            className="grid gap-3"
          >
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="glass-card flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-accent-warm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-ink-soft">{item.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/30" />
              </Link>
            ))}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass-card p-4 sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] text-accent-warm">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">連続日数</p>
              <p className="mt-2 text-2xl font-semibold text-white">{dailyRhythm.streak}</p>
            </div>

            <Link href="/settings" className="glass-card p-4 sm:p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] text-accent-warm">
                <Bell className="w-4 h-4" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">通知</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {settings.enabled ? `${formatReminder(settings.hour, settings.minute)} に通知` : "通知を設定する"}
              </p>
            </Link>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
