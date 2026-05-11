"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Compass,
  Flame,
  Heart,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { NotificationPermission } from "@/components/NotificationPermission";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocalStorage } from "@/hooks";
import { thisOrThatQuestions } from "@/lib/data/thisOrThatQuestions";
import { buildThisOrThatProfile, loadThisOrThatState } from "@/lib/thisOrThatProfile";

type DailyRhythm = {
  streak: number;
  lastOpenedDate: string | null;
};

const DAILY_RHYTHM_KEY = "talking-daily-rhythm";

const dailyFocuses = [
  {
    title: "3分だけ空気をあたためる",
    description: "まずは軽い質問を1つ。相手に話しやすい温度をつくる日。",
    href: "/cards",
    cta: "カードから始める",
  },
  {
    title: "会う前の一言を整える",
    description: "出会う前の会話で止まらないように、AI相手に1ラリーだけ練習。",
    href: "/roleplay",
    cta: "ロールプレイを始める",
  },
  {
    title: "自分の傾向をひとつ知る",
    description: "二択を数問だけ進めて、今日の自分のノリや価値観を言語化する日。",
    href: "/this-or-that",
    cta: "This or Thatへ",
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
  const favoriteCount = progress.favorites.length;
  const practiceLevel = answeredCount >= 20 ? "Conversation glow is on." : answeredCount >= 8 ? "Pace is building." : "Small reps, strong effect.";

  const suggestedFocus = useMemo(() => {
    if (favoriteCount >= 3) return dailyFocuses[1];
    if (answeredCount >= 6) return dailyFocuses[2];
    return dailyFocuses[0];
  }, [answeredCount, favoriteCount]);

  const quickStats = [
    {
      label: "連続日数",
      value: `${dailyRhythm.streak} day${dailyRhythm.streak === 1 ? "" : "s"}`,
      subtext: dailyRhythm.streak >= 5 ? "かなり良い流れです" : "短くても続けるのが強いです",
      icon: <Flame className="w-4 h-4" />,
    },
    {
      label: "残したメモ",
      value: `${answeredCount}`,
      subtext: "自分の言葉が少しずつ増えています",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      label: "気になる質問",
      value: `${favoriteCount}`,
      subtext: favoriteCount > 0 ? "また使いたい話題が見えています" : "気になった問いを貯めていけます",
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  const featureCards = [
    {
      id: "roleplay",
      title: "会う前の会話を試運転する",
      description: "マッチ後、初デート前、日程調整。詰まりやすいところをAI相手に先回りで練習。",
      href: "/roleplay",
      icon: <TrendingUp className="w-5 h-5" />,
      eyebrow: "Most effective",
    },
    {
      id: "cards",
      title: "話題の引き出しを増やす",
      description: "雑談に困ったときの質問を、短いメモつきで自分のものにしていく。",
      href: "/cards",
      icon: <Lightbulb className="w-5 h-5" />,
      eyebrow: "Low pressure",
    },
    {
      id: "this-or-that",
      title: "自分の傾向を言葉にする",
      description: `${thisOrThatQuestions.length}問の二択から、恋愛や会話で出やすい自分の傾向を見つける。`,
      href: "/this-or-that",
      icon: <Sparkles className="w-5 h-5" />,
      eyebrow: "Self discovery",
    },
    {
      id: "situations",
      title: "場面別の返しを仕込んでおく",
      description: "相手との距離感に合わせて、重すぎず軽すぎない一言を探せる。",
      href: "/situations",
      icon: <Compass className="w-5 h-5" />,
      eyebrow: "Practical lines",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mesh-gradient" />

      <header className="relative px-5 pt-6 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#ffd7b5]/80"
          >
            <Star className="h-3.5 w-3.5" />
            Daily Conversation Ritual
          </motion.div>
        </div>
      </header>

      <main className="relative px-5 pb-12 pt-5 sm:px-8 sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="ambient-ring overflow-hidden rounded-[2rem] border border-white/10 bg-panel p-6 sm:rounded-[2.5rem] sm:p-10"
            >
              <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                <span className="rounded-full border border-white/10 px-3 py-1">毎日少しずつ、会話の温度を上げる</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Today&apos;s focus is ready</span>
              </div>

              <h1 className="max-w-3xl text-5xl leading-[0.9] sm:text-7xl">
                毎日ひらきたくなる、
                <br />
                会話の支度部屋。
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft sm:text-lg">
                出会う前の会話は、勢いより準備でかなり変わります。今日は迷わず始められるように、
                このアプリを「何をやるか決まっている入口」に整えました。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={suggestedFocus.href} className="btn-primary inline-flex items-center justify-center gap-2">
                  <span>{suggestedFocus.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/settings" className="btn-secondary inline-flex items-center justify-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>
                    {settings.enabled ? `通知 ${formatReminder(settings.hour, settings.minute)}` : "通知を整える"}
                  </span>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-accent-warm">
                      {stat.icon}
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-ink-faint">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">{stat.subtext}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="glass-card ambient-ring overflow-hidden p-6 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#ffd7b5]/70">Tonight&apos;s prompt</p>
                <h2 className="mt-3 text-3xl leading-tight">{suggestedFocus.title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{suggestedFocus.description}</p>
                <Link
                  href={suggestedFocus.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#ffe5ca] transition hover:text-white"
                >
                  今すぐ始める
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="glass-card p-6 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Practice mood</p>
                <p className="mt-3 text-lg leading-8 text-white/90">{practiceLevel}</p>
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">One small win</p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">
                    今日は長くやらなくて大丈夫です。1問メモを書くか、1ラリー返せたら十分に前進です。
                  </p>
                </div>
              </div>
            </motion.aside>
          </section>

          {showNotificationPrompt && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <NotificationPermission onEnable={requestPermission} onDismiss={dismissPrompt} />
            </motion.div>
          )}

          <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="glass-card p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Daily route</p>
                  <h2 className="mt-3 text-3xl">今日の流れは、これで十分です。</h2>
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-ink-soft">5 to 10 min</div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "1問だけカードで肩慣らし",
                  "AIロールプレイで返しを1回試す",
                  "This or Thatで自分の傾向を1つ拾う",
                ].map((step, index) => (
                  <div key={step} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1c1622]">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-ink-soft">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="glass-card p-6 sm:p-8"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Why it works</p>
              <h2 className="mt-3 text-3xl">続けたくなる理由を、ちゃんと見える形に。</h2>
              <div className="mt-7 grid gap-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">何をやるか迷わない</p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">毎日おすすめが1つ出るので、開いた瞬間に最初の一歩が決まります。</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">自分の言葉が積み上がる</p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">質問メモやお気に入りが残るので、その日の練習が翌日にちゃんとつながります。</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">出会う前の不安に直結する</p>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">実際に詰まりやすい場面を先に通ることで、本番で止まりにくくなります。</p>
                </div>
              </div>
            </motion.div>
          </section>

          {profileHint && (
            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.18 }}
                className="glass-card p-6 sm:p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Your current pattern</p>
                <h2 className="mt-3 text-3xl">{profileHint.archetype}</h2>
                <p className="mt-4 text-sm leading-7 text-ink-soft">{profileHint.summary}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {profileHint.strengths.slice(0, 3).map((strength) => (
                    <div key={strength} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-ink-soft">
                      {strength}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="glass-card p-6 sm:p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Bridge to practice</p>
                <h2 className="mt-3 text-3xl">次にやるなら {profileHint.recommendedScenarioLabel}</h2>
                <p className="mt-4 text-sm leading-7 text-ink-soft">{profileHint.datingAdvice}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href={`/roleplay?scenario=${profileHint.recommendedScenarioId}`} className="btn-primary inline-flex items-center justify-center gap-2">
                    この場面を練習する
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/this-or-that" className="btn-secondary inline-flex items-center justify-center gap-2">
                    傾向を見直す
                  </Link>
                </div>
              </motion.div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Practice rooms</p>
                <h2 className="mt-2 text-3xl">今日はどこから入ってもいい。</h2>
              </div>
              <p className="hidden text-sm text-ink-soft sm:block">でも、戻ってきたくなる入口にはしておく。</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 + index * 0.05 }}
                >
                  <Link href={feature.href} className="glass-card group flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">{feature.eyebrow}</span>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-accent-warm">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="mt-6 text-2xl leading-tight">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-ink-soft">{feature.description}</p>
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#ffe5ca] transition group-hover:gap-3 group-hover:text-white">
                      開く
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
