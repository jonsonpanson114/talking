"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Send,
  User,
  Bot,
  RotateCcw,
  CheckCircle,
  Target,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  HeartHandshake,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { partnerStyles, roleplayScenarios, partnerNames } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, ConversationMessage, ConversationSettings, RoleplayScenarioId } from "@/lib/types";
import { buildThisOrThatProfile, loadThisOrThatState } from "@/lib/thisOrThatProfile";
import Link from "next/link";

const personaIds = ["casual", "serious", "humorous", "cool"] as const;

const scenarioPlaybooks: Record<
  RoleplayScenarioId,
  {
    focusQuestion: string;
    mission: string;
    reminders: string[];
    quickReplies: string[];
  }
> = {
  "matching-app-first-chat": {
    focusQuestion: "最初の数往復で、安心感と興味の両方をどう作るか？",
    mission: "プロフィール由来の話題を1つ拾って、質問だけで終わらせず自分の温度も少し混ぜる。",
    reminders: [
      "いきなり距離を詰めすぎない",
      "質問のあとに短い自己開示を入れる",
      "返信しやすい軽さを残す",
    ],
    quickReplies: [
      "それ気になる。自分はこういうの好きなんだけど、そっちはどう？",
      "たしかにいいね。その流れで聞きたいんだけど、最近いちばん楽しかったのって何？",
      "わかる。話しやすそうだなと思ってた。",
    ],
  },
  "date-scheduling": {
    focusQuestion: "押しすぎず、相手の都合を尊重しながら具体化できるか？",
    mission: "候補を絞りすぎずに2択くらいで出して、相手の返しやすさを優先する。",
    reminders: [
      "候補は広すぎず狭すぎず",
      "断りやすい逃げ道も残す",
      "会う前提を急に重くしない",
    ],
    quickReplies: [
      "もし今週なら、平日夜か週末どっちが楽そう？",
      "無理ない範囲で全然大丈夫。合わせやすい時間帯ある？",
      "軽くお茶くらいの感じで考えてた。",
    ],
  },
  "before-first-date": {
    focusQuestion: "前日に緊張を下げつつ、当日の会話の種を作れるか？",
    mission: "確認だけで終わらず、当日に話しやすくなる軽い話題を一つ置く。",
    reminders: [
      "確認メッセージだけで終わらせない",
      "安心感を優先して長文にしすぎない",
      "当日につながる話題を1つだけ置く",
    ],
    quickReplies: [
      "明日よろしくね。楽しみにしてる。ちなみに甘いものって結構好き？",
      "少し緊張するけど楽しみ。普段こういう時って早めに着く派？",
      "明日話せそうなネタを一つ持っていこうと思ってた。",
    ],
  },
  "after-first-date": {
    focusQuestion: "お礼と好意を自然に伝えながら、次につなげられるか？",
    mission: "感想を具体的に1つ伝えて、相手の感想も聞けるように返す。",
    reminders: [
      "楽しかっただけで終わらせない",
      "相手に合わせて次の圧を調整する",
      "具体的な感想を入れる",
    ],
    quickReplies: [
      "今日はありがとう。あの話の流れ、かなり好きだった。",
      "帰ってからじわっと楽しかったなって思ってた。",
      "自分はかなり話しやすかったけど、そっちはどうだった？",
    ],
  },
  "hobby-deep-dive": {
    focusQuestion: "相手のこだわりを引き出しつつ、自分の熱量も重ねられるか？",
    mission: "相手の好きポイントを具体化させて、その後に自分の視点を重ねる。",
    reminders: [
      "知識披露だけにしない",
      "好きな理由を聞く",
      "共感だけでなく自分の視点も足す",
    ],
    quickReplies: [
      "そこ気になる。どのへんから一気にハマった？",
      "わかる。自分はその中でもここに惹かれる。",
      "それって詳しくない人にも伝わる魅力って何だと思う？",
    ],
  },
  "recovery-chat": {
    focusQuestion: "間が空いた空気を重くせず、自然に戻せるか？",
    mission: "言い訳より空気の再開を優先して、相手が返しやすい余白を残す。",
    reminders: [
      "重く謝りすぎない",
      "再開のきっかけを具体的にする",
      "返事の義務感を減らす",
    ],
    quickReplies: [
      "ちょっと間あいちゃったけど、ふと思い出して連絡してみた。",
      "忙しい時期かなと思いつつ、軽く話せたらうれしいなと思って。",
      "この前の話、あとからじわっと気になってた。",
    ],
  },
  "mutual-travel-planning": {
    focusQuestion: "希望が違っても、会話の温度を下げずにすり合わせできるか？",
    mission: "自分の希望を出しつつ、相手の優先順位を聞いて妥協点を一緒に探す。",
    reminders: [
      "自分の案を押し切らない",
      "相手の優先順位を確認する",
      "否定ではなく提案で返す",
    ],
    quickReplies: [
      "自分はこっち気になってたけど、そっちの良さも聞いてみたい。",
      "もし一つだけ優先するとしたら、景色とご飯どっち重視？",
      "両方いいから、いいとこ取りできないか考えたい。",
    ],
  },
  "professional-networking": {
    focusQuestion: "仕事の話を固くしすぎず、人柄の話に広げられるか？",
    mission: "仕事内容の説明で終わらせず、価値観や好きな働き方まで掘る。",
    reminders: [
      "肩書きの確認だけで終わらない",
      "価値観の話につなげる",
      "重さを感じたら趣味側に逃がす",
    ],
    quickReplies: [
      "その仕事って、やってて気持ちいい瞬間どこにある？",
      "仕事内容より、そこに向いてる人のタイプが気になる。",
      "仕事の話って人柄出るから、わりと好きなんだよね。",
    ],
  },
  "difficult-apology": {
    focusQuestion: "誠実さを出しつつ、関係を止めない言い方ができるか？",
    mission: "謝罪の目的を明確にして、相手に負担を押し付けない一言で締める。",
    reminders: [
      "言い訳が長くならないようにする",
      "相手への配慮を先に置く",
      "再提案は空気を見てから",
    ],
    quickReplies: [
      "まずはちゃんと謝りたくて連絡した。直前になって本当にごめん。",
      "言い訳っぽくしたくないから短く言うと、自分の不手際だった。",
      "すぐ返事を求めたいわけじゃなくて、まずは誠実に伝えたかった。",
    ],
  },
};

export default function RoleplayPage() {
  const [step, setStep] = useState<"settings" | "play" | "result">("settings");
  const [settings, setSettings] = useState<ConversationSettings>(() => {
    const randomPartner = partnerNames[Math.floor(Math.random() * partnerNames.length)];
    const randomScenario = roleplayScenarios[Math.floor(Math.random() * roleplayScenarios.length)];
    const randomStyle = partnerStyles[Math.floor(Math.random() * partnerStyles.length)];
    const randomPersona = personaIds[Math.floor(Math.random() * personaIds.length)];

    return {
      userName: "ノリ",
      partnerName: randomPartner,
      persona: randomPersona,
      scenarioId: randomScenario.id,
      partnerStyleId: randomStyle.id,
    };
  });
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<ConversationEvaluation | null>(null);
  const [profileHint, setProfileHint] = useState<ReturnType<typeof buildThisOrThatProfile> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requestedScenario = new URLSearchParams(window.location.search).get("scenario");
    if (!requestedScenario) return;
    const exists = roleplayScenarios.some((item) => item.id === requestedScenario);
    if (!exists) return;

    setSettings((prev) => ({ ...prev, scenarioId: requestedScenario as RoleplayScenarioId }));
  }, []);

  useEffect(() => {
    const state = loadThisOrThatState();
    setProfileHint(buildThisOrThatProfile(state.history));
  }, []);

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 35000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const normalizeMessage = (text: string, fallback: string) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return fallback;
    return /[。！？!?]$/.test(trimmed) ? trimmed : `${trimmed}。`;
  };

  const personas = [
    { id: "casual", label: "Casual", description: "リラックス、気さくな感じ" },
    { id: "serious", label: "Serious", description: "誠実、聞き上手" },
    { id: "humorous", label: "Humorous", description: "冗談を交えて楽しく" },
    { id: "cool", label: "Cool", description: "短めの会話、主導的" },
  ] as const;

  const selectedScenario = useMemo(
    () => roleplayScenarios.find((item) => item.id === settings.scenarioId) ?? roleplayScenarios[0],
    [settings.scenarioId]
  );

  const selectedPartnerStyle = useMemo(
    () => partnerStyles.find((item) => item.id === settings.partnerStyleId) ?? partnerStyles[0],
    [settings.partnerStyleId]
  );

  const currentPlaybook = scenarioPlaybooks[settings.scenarioId] ?? scenarioPlaybooks["matching-app-first-chat"];

  const handleShuffleAll = () => {
    const randomPartner = partnerNames[Math.floor(Math.random() * partnerNames.length)];
    const randomScenario = roleplayScenarios[Math.floor(Math.random() * roleplayScenarios.length)];
    const randomStyle = partnerStyles[Math.floor(Math.random() * partnerStyles.length)];
    const randomPersona = personaIds[Math.floor(Math.random() * personaIds.length)];

    setSettings((prev) => ({
      ...prev,
      partnerName: randomPartner,
      persona: randomPersona,
      scenarioId: randomScenario.id,
      partnerStyleId: randomStyle.id,
    }));
  };

  const handleStartConversation = async () => {
    if (!settings.userName || !settings.partnerName) {
      alert("名前を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithTimeout("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          data: {
            question: currentPlaybook.focusQuestion,
            userName: settings.userName,
            partnerName: settings.partnerName,
            persona: settings.persona,
            scenarioId: settings.scenarioId,
            partnerStyleId: settings.partnerStyleId,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "start_failed");
      }
      const assistantText = normalizeMessage(
        data?.response,
        `はじめまして、${settings.userName}さん。最近ちょっと気分が上がった出来事ってありましたか？`
      );

      setMessages([
        {
          role: "assistant",
          content: assistantText,
          timestamp: new Date(),
        },
      ]);
      setInput(currentPlaybook.quickReplies[0] ?? "");
      setStep("play");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("会話の開始に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ConversationMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetchWithTimeout("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "continue",
          data: {
            messages: [...messages, userMessage],
            userName: settings.userName,
            partnerName: settings.partnerName,
            persona: settings.persona,
            scenarioId: settings.scenarioId,
            partnerStyleId: settings.partnerStyleId,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "continue_failed");
      }
      const assistantText = normalizeMessage(
        data?.response,
        "なるほど、それはいいですね。もう少し詳しく聞いてもいいですか？"
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("メッセージの送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (messages.length < 4) {
      if (!confirm("会話が短いですが、終了しますか？もう少し続けてみてください。")) {
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetchWithTimeout("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          data: {
            messages,
            userName: settings.userName,
            partnerName: settings.partnerName,
            scenarioId: settings.scenarioId,
            partnerStyleId: settings.partnerStyleId,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "evaluate_failed");
      }

      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setStep("result");
      }
    } catch (error) {
      console.error("Failed to evaluate conversation:", error);
      alert("評価の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("settings");
    setMessages([]);
    setInput("");
    setEvaluation(null);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />

      <header className="relative pt-2 sm:pt-8 pb-1 sm:pb-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="w-3 h-3 text-white/20" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-white/20">
              Session
            </span>
          </div>
        </div>
      </header>

      <main className="relative px-4 sm:px-6 pb-4 sm:pb-24 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "settings" && (
            <motion.div
              key="settings"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -5 }}
              variants={fadeIn}
              className="space-y-4 sm:space-y-8"
            >
              <div className="flex items-end justify-between mb-0.5 sm:mb-2">
                <div>
                  <h1 className="text-xl sm:text-4xl font-bold mb-0.5 sm:mb-2 tracking-tight">Roleplay</h1>
                  <p className="text-[10px] sm:text-base text-white/20 font-light italic">会う前の会話を、本番前に一度通しておく。</p>
                </div>
                <button
                  onClick={handleShuffleAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">Shuffle All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-3">
                  <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10 ml-2">You (Fixed)</label>
                  <input
                    type="text"
                    value={settings.userName}
                    readOnly
                    className="input-elegant w-full py-2 sm:py-3 text-xs opacity-50 cursor-not-allowed bg-white/[0.02]"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10">Target</label>
                    <button
                      onClick={() => {
                        const randomName = partnerNames[Math.floor(Math.random() * partnerNames.length)];
                        setSettings((prev) => ({ ...prev, partnerName: randomName }));
                      }}
                      className="text-[8px] sm:text-[9px] text-white/20 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-2 h-2" />
                      Randomize
                    </button>
                  </div>
                  <input
                    type="text"
                    value={settings.partnerName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, partnerName: e.target.value }))}
                    placeholder="Partner name"
                    className="input-elegant w-full py-2 sm:py-3 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-3">
                <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10 ml-2">Scenario</label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {roleplayScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSettings((prev) => ({ ...prev, scenarioId: scenario.id }))}
                      className={`glass-card text-left p-3 sm:p-5 group transition-all duration-500 ${
                        settings.scenarioId === scenario.id
                          ? "bg-white/[0.08] ring-1 ring-white/10 shadow-none"
                          : "opacity-40 grayscale hover:grayscale-0 hover:opacity-100 border-transparent shadow-none"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5 sm:mb-2">
                        <h3 className="text-sm sm:text-lg font-semibold">{scenario.label}</h3>
                        <div className={`w-1 h-1 rounded-full transition-all duration-500 mt-1.5 ${settings.scenarioId === scenario.id ? "bg-white" : "bg-white/10"}`} />
                      </div>
                      <p className="text-[10px] sm:text-sm text-white/20 font-light leading-snug line-clamp-1 sm:line-clamp-none">{scenario.context}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-white/40" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">この場面で練習すること</p>
                  </div>
                  <p className="text-base sm:text-lg leading-8 text-white/85">{currentPlaybook.mission}</p>
                  <div className="mt-5 space-y-2">
                    {currentPlaybook.reminders.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartHandshake className="w-4 h-4 text-white/40" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">今回の起点テーマ</p>
                  </div>
                  <p className="text-base sm:text-lg leading-8 text-white/85">{currentPlaybook.focusQuestion}</p>
                  {profileHint && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">あなたの傾向から見ると</p>
                      <p className="mt-2 text-sm leading-7 text-white/65">
                        {profileHint.archetype} なので、今回は
                        「{profileHint.datingAdvice}」
                        を意識するとかなり実戦向きです。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Partner Vibration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {partnerStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSettings((prev) => ({ ...prev, partnerStyleId: style.id }))}
                        className={`w-full glass p-3 sm:p-4 rounded-xl text-left text-[11px] sm:text-sm transition-all duration-300 ${
                          settings.partnerStyleId === style.id ? "bg-white/10 text-white border-white/20" : "text-white/30 hover:bg-white/5 border-transparent"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Tone & Manner</label>
                  <div className="grid grid-cols-2 gap-2">
                    {personas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => setSettings((prev) => ({ ...prev, persona: persona.id }))}
                        className={`w-full glass p-3 sm:p-4 rounded-xl text-left text-[11px] sm:text-sm transition-all duration-300 ${
                          settings.persona === persona.id ? "bg-white/10 text-white border-white/20" : "text-white/30 hover:bg-white/5 border-transparent"
                        }`}
                      >
                        {persona.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-4 h-4 text-white/40" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">出だしの方向</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {currentPlaybook.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => setInput(reply)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-left text-sm leading-7 text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartConversation}
                disabled={!settings.userName || !settings.partnerName || isLoading}
                className="btn-primary w-full group py-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold">Initialize Session</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </motion.div>
          )}

          {step === "play" && (
            <motion.div
              key="play"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={fadeIn}
              className="flex flex-col h-[80vh] sm:h-[75vh]"
            >
              <div className="glass-card mb-4 sm:mb-6 p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center text-white/40">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/20 font-bold leading-none mb-1">Target</p>
                    <h2 className="text-xs sm:text-sm font-semibold">{settings.partnerName}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/20 font-bold leading-none mb-1">Scenario</p>
                  <p className="text-[10px] sm:text-xs font-light text-white/60">{selectedScenario.label}</p>
                </div>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">今回のミッション</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">{currentPlaybook.mission}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">返しの方向</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentPlaybook.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => setInput(reply)}
                        className="rounded-full border border-white/10 px-3 py-2 text-left text-[11px] text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2 sm:pr-4 scrollbar-hide no-scrollbar">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-white text-black font-medium rounded-tr-none shadow-xl"
                          : "glass rounded-tl-none font-light text-white/80"
                      }`}
                    >
                      {message.content}
                      <div className={`text-[8px] sm:text-[9px] mt-1.5 sm:mt-2 opacity-30 ${message.role === "user" ? "text-black" : "text-white"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 sm:pt-8 space-y-3 sm:space-y-4">
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="input-elegant w-full min-h-[60px] sm:min-h-[80px] pr-16 sm:pr-20 resize-none pt-4 sm:pt-6 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 glass w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/40 hover:text-white"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                  <p className="text-[8px] sm:text-[9px] text-white/10 uppercase tracking-[0.2em]">Neural Link Stable</p>
                  <button
                    onClick={handleEndConversation}
                    disabled={messages.length < 2 || isLoading}
                    className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "result" && evaluation && (
            <motion.div
              key="result"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={fadeIn}
              className="space-y-8 sm:space-y-12"
            >
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-semibold text-white/20 mb-2 sm:mb-4">Evaluation</p>
                <div className="relative inline-block">
                  <span className="text-7xl sm:text-9xl font-bold tracking-tighter">{evaluation.score}</span>
                  <span className="absolute -right-6 sm:-right-8 top-2 sm:top-4 text-xl sm:text-2xl font-light text-white/20">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-6 sm:p-8 border-white/20 bg-white/[0.05]">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-white/60">Primary Focus</h3>
                  </div>
                  <p className="text-base sm:text-lg font-medium leading-relaxed mb-4 sm:mb-6">{evaluation.oneFocusImprovement}</p>
                  <div className="glass p-3 sm:p-4 rounded-xl border-white/5">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/20 mb-1 sm:mb-2 text-center">Reference</p>
                    <p className="text-xs sm:text-sm italic text-white/80 text-center">"{evaluation.nextMessageExample}"</p>
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-white/20 mb-4 sm:mb-6 text-center">Matrix</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Curiosity", score: evaluation.curiosityScore },
                      { label: "Empathy", score: evaluation.empathyScore },
                      { label: "Pace", score: evaluation.paceScore },
                      { label: "Natural", score: evaluation.naturalnessScore },
                    ].map((m) => (
                      <div key={m.label} className="space-y-1.5">
                        <div className="flex justify-between text-[8px] sm:text-[9px] font-medium tracking-wider uppercase text-white/40">
                          <span>{m.label}</span>
                          <span>{m.score}%</span>
                        </div>
                        <div className="h-1 glass rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.score}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 sm:mb-8 justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-white/60">Key Moments</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {evaluation.goodMoments.map((moment, i) => (
                    <div key={i} className="space-y-2 sm:space-y-3 p-3 rounded-2xl bg-white/[0.02] sm:bg-transparent border border-white/[0.05] sm:border-none">
                      <p className="text-[8px] uppercase font-bold text-white/20">Turn {moment.turn}</p>
                      <p className="text-xs sm:text-sm font-medium italic">"{moment.quote}"</p>
                      <p className="text-[10px] sm:text-xs text-white/40 font-light leading-relaxed">{moment.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleReset}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold">New Session</span>
                </button>
                <Link
                  href="/"
                  className="btn-secondary w-full flex items-center justify-center gap-2 py-4"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold">Studio</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
