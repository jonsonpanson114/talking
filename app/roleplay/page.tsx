"use client";

import { useMemo, useState } from "react";
import { Home, Send, User, Bot, RotateCcw, CheckCircle, Target, Sparkles, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/lib/data/questions";
import { partnerStyles, roleplayScenarios } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, ConversationMessage, ConversationSettings } from "@/lib/types";
import Link from "next/link";

export default function RoleplayPage() {
  const [step, setStep] = useState<"settings" | "play" | "result">("settings");
  const [settings, setSettings] = useState<ConversationSettings>({
    userName: "",
    partnerName: "",
    persona: "casual",
    scenarioId: "matching-app-first-chat",
    partnerStyleId: "positive",
  });
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<ConversationEvaluation | null>(null);

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

  const handleStartConversation = async () => {
    if (!settings.userName || !settings.partnerName) {
      alert("名前を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          data: {
            question: selectedQuestion.text,
            userName: settings.userName,
            partnerName: settings.partnerName,
            persona: settings.persona,
            scenarioId: settings.scenarioId,
            partnerStyleId: settings.partnerStyleId,
          },
        }),
      });
      const data = await response.json();

      setMessages([
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
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
      const response = await fetch("/api/ai", {
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
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
      const response = await fetch("/api/ai", {
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
              <div>
                <h1 className="text-xl sm:text-4xl font-bold mb-0.5 sm:mb-2 tracking-tight">Roleplay</h1>
                <p className="text-[10px] sm:text-base text-white/20 font-light italic">Vibe check before session.</p>
              </div>

              {/* 名前入力 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-3">
                  <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10 ml-2">You</label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                    placeholder="Your name"
                    className="input-elegant w-full py-2 sm:py-3 text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-3">
                  <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10 ml-2">Target</label>
                  <input
                    type="text"
                    value={settings.partnerName}
                    onChange={(e) => setSettings({ ...settings, partnerName: e.target.value })}
                    placeholder="Partner name"
                    className="input-elegant w-full py-2 sm:py-3 text-xs"
                  />
                </div>
              </div>

              {/* シチュエーション */}
              <div className="space-y-1.5 sm:space-y-3">
                <label className="text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/10 ml-2">Scenario</label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {roleplayScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSettings({ ...settings, scenarioId: scenario.id })}
                      className={`glass-card text-left p-3 sm:p-5 group transition-all duration-500 ${
                        settings.scenarioId === scenario.id ? "bg-white/[0.08] ring-1 ring-white/10 shadow-none" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-100 border-transparent shadow-none"
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

              {/* 相手タイプとペルソナ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Partner Vibration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {partnerStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSettings({ ...settings, partnerStyleId: style.id })}
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
                        onClick={() => setSettings({ ...settings, persona: persona.id })}
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

              {/* 開始ボタン */}
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
              {/* 会話ヘッダー */}
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

              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2 sm:pr-4 scrollbar-hide no-scrollbar">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      message.role === "user" 
                        ? "bg-white text-black font-medium rounded-tr-none shadow-xl" 
                        : "glass rounded-tl-none font-light text-white/80"
                    }`}>
                      {message.content}
                      <div className={`text-[8px] sm:text-[9px] mt-1.5 sm:mt-2 opacity-30 ${message.role === "user" ? "text-black" : "text-white"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

              {/* 入力エリア */}
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

              {/* メインインサイト */}
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

              {/* 特筆すべき点 */}
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
