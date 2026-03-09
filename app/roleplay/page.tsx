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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      
      <header className="relative pt-8 pb-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">Back to Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-white/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/20">
              Neural Assistant Active
            </span>
          </div>
        </div>
      </header>

      <main className="relative px-6 pb-24 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "settings" && (
            <motion.div
              key="settings"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              variants={fadeIn}
              className="space-y-8"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Roleplay Session</h1>
                <p className="text-white/30 font-light">会話のシチュエーションと相手のタイプを設定します。</p>
              </div>

              {/* 名前入力 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Your Identity</label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                    placeholder="自分の名前"
                    className="input-elegant w-full"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Partner Persona</label>
                  <input
                    type="text"
                    value={settings.partnerName}
                    onChange={(e) => setSettings({ ...settings, partnerName: e.target.value })}
                    placeholder="相手の名前"
                    className="input-elegant w-full"
                  />
                </div>
              </div>

              {/* シチュエーション */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Contextual Scenario</label>
                <div className="grid grid-cols-1 gap-3">
                  {roleplayScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSettings({ ...settings, scenarioId: scenario.id })}
                      className={`glass-card text-left p-5 group transition-all duration-500 ${
                        settings.scenarioId === scenario.id ? "bg-white/[0.08] ring-1 ring-white/20" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{scenario.label}</h3>
                        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${settings.scenarioId === scenario.id ? "bg-white" : "bg-white/10"}`} />
                      </div>
                      <p className="text-sm text-white/40 font-light leading-relaxed">{scenario.context}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 相手タイプとペルソナ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Partner Vibration</label>
                  <div className="space-y-2">
                    {partnerStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSettings({ ...settings, partnerStyleId: style.id })}
                        className={`w-full glass p-4 rounded-xl text-left text-sm transition-all duration-300 ${
                          settings.partnerStyleId === style.id ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-white/20 ml-2">Tone & Manner</label>
                  <div className="space-y-2">
                    {personas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => setSettings({ ...settings, persona: persona.id })}
                        className={`w-full glass p-4 rounded-xl text-left text-sm transition-all duration-300 ${
                          settings.persona === persona.id ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5"
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
                className="btn-primary w-full group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Initialize Session</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
              className="flex flex-col h-[75vh]"
            >
              {/* 会話ヘッダー */}
              <div className="glass-card mb-6 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold leading-none mb-1">Session Target</p>
                    <h2 className="text-sm font-semibold">{settings.partnerName}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold leading-none mb-1">Scenario</p>
                  <p className="text-xs font-light text-white/60">{selectedScenario.label}</p>
                </div>
              </div>

              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-sm leading-relaxed ${
                      message.role === "user" 
                        ? "bg-white text-black font-medium rounded-tr-none shadow-xl" 
                        : "glass rounded-tl-none font-light text-white/80"
                    }`}>
                      {message.content}
                      <div className={`text-[9px] mt-2 opacity-30 ${message.role === "user" ? "text-black" : "text-white"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass px-6 py-4 rounded-3xl rounded-tl-none">
                      <div className="flex gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 入力エリア */}
              <div className="pt-8 space-y-4">
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
                    placeholder="Type your message..."
                    className="input-elegant w-full min-h-[80px] pr-20 resize-none pt-6"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-4 bottom-4 glass w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/40 hover:text-white"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center px-2">
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Neural Link Stable</p>
                  <button
                    onClick={handleEndConversation}
                    disabled={messages.length < 2 || isLoading}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                  >
                    Terminate & Analyze
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
              className="space-y-12"
            >
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-white/20 mb-4">Final Evaluation</p>
                <div className="relative inline-block">
                  <span className="text-9xl font-bold tracking-tighter">{evaluation.score}</span>
                  <span className="absolute -right-8 top-4 text-2xl font-light text-white/20">/100</span>
                </div>
              </div>

              {/* メインインサイト */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 border-white/20 bg-white/[0.05]">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-5 h-5 text-white/40" />
                    <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Primary Focus</h3>
                  </div>
                  <p className="text-lg font-medium leading-relaxed mb-6">{evaluation.oneFocusImprovement}</p>
                  <div className="glass p-4 rounded-xl border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-white/20 mb-2">Example Phrase</p>
                    <p className="text-sm italic text-white/80">"{evaluation.nextMessageExample}"</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-6">Performance Matrix</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Curiosity", score: evaluation.curiosityScore },
                        { label: "Empathy", score: evaluation.empathyScore },
                        { label: "Pace", score: evaluation.paceScore },
                        { label: "Naturalness", score: evaluation.naturalnessScore },
                      ].map((m) => (
                        <div key={m.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-medium tracking-wider uppercase text-white/40">
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
              </div>

              {/* 特筆すべき点 */}
              <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-8">
                  <CheckCircle className="w-5 h-5 text-white/40" />
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Key Moments</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {evaluation.goodMoments.map((moment, i) => (
                    <div key={i} className="space-y-3">
                      <p className="text-[9px] uppercase font-bold text-white/20">Turn {moment.turn}</p>
                      <p className="text-sm font-medium">"{moment.quote}"</p>
                      <p className="text-xs text-white/40 font-light leading-relaxed">{moment.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleReset}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start New Session</span>
                </button>
                <Link
                  href="/"
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Exit to Studio</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
