"use client";

import { useMemo, useState } from "react";
import { Home, Send, User, Bot, RotateCcw, CheckCircle, Target } from "lucide-react";
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
    { id: "casual", label: "カジュアル", description: "リラックス、気さくな感じ" },
    { id: "serious", label: "少し真面目", description: "誠実、聞き上手" },
    { id: "humorous", label: "ユーモラス", description: "冗談を交えて楽しく" },
    { id: "cool", label: "クール", description: "短めの会話、主導的" },
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

  if (step === "settings") {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <header className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm">トップ</span>
          </Link>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">出会う前ロールプレイ設定</h1>
          <p className="text-center text-text-secondary mb-6">シチュエーションと相手タイプを選んで実戦練習</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">あなたの名前</label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                  placeholder="例: 太郎"
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">相手の名前（AI）</label>
                <input
                  type="text"
                  value={settings.partnerName}
                  onChange={(e) => setSettings({ ...settings, partnerName: e.target.value })}
                  placeholder="例: 花子"
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">シチュエーション</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roleplayScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSettings({ ...settings, scenarioId: scenario.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.scenarioId === scenario.id
                        ? "bg-emerald-500/10 border-emerald-400"
                        : "bg-card border-border hover:bg-card-hover"
                    }`}
                  >
                    <div className="font-semibold mb-1">{scenario.label}</div>
                    <div className="text-xs text-text-secondary mb-1">{scenario.description}</div>
                    <div className="text-xs text-emerald-300">目標: {scenario.objective}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">相手タイプ</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {partnerStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSettings({ ...settings, partnerStyleId: style.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.partnerStyleId === style.id
                        ? "bg-sky-500/10 border-sky-400"
                        : "bg-card border-border hover:bg-card-hover"
                    }`}
                  >
                    <div className="font-semibold mb-1">{style.label}</div>
                    <div className="text-xs text-text-secondary">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">相手の会話トーン</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSettings({ ...settings, persona: persona.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.persona === persona.id
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-card border-border hover:bg-card-hover"
                    }`}
                  >
                    <div className="font-semibold">{persona.label}</div>
                    <div className="text-xs text-text-secondary mt-1">{persona.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">会話の最初に使う話題</label>
              <select
                value={selectedQuestion.id}
                onChange={(e) => setSelectedQuestion(questions.find((q) => q.id === e.target.value) || questions[0])}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              >
                {questions
                  .filter((q) => q.type === "standard")
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.text}
                    </option>
                  ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary mb-1">今回の練習設定</p>
              <p>シチュエーション: {selectedScenario.label}</p>
              <p>相手タイプ: {selectedPartnerStyle.label}</p>
            </div>

            <button
              onClick={handleStartConversation}
              disabled={!settings.userName || !settings.partnerName || isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold hover:from-emerald-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "準備中..." : "ロールプレイ開始"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "play") {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <header className="mb-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-sm">設定に戻る</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-text-secondary">{selectedScenario.label}</p>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              <span className="text-text-primary font-semibold">{settings.userName}</span>
              <span className="text-text-secondary">vs</span>
              <Bot className="w-5 h-5 text-emerald-400" />
              <span className="text-text-primary font-semibold">{settings.partnerName}</span>
            </div>
          </div>
          <div />
        </header>

        <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          <div className="mb-3 rounded-xl border border-border bg-card px-4 py-2 text-sm text-text-secondary">
            目標: {selectedScenario.objective}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-accent text-white"
                      : "bg-card text-text-primary border border-border"
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="返答を入力...（Shift+Enterで改行）"
              className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none max-h-32"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleEndConversation}
            disabled={messages.length < 2 || isLoading}
            className="w-full mt-4 py-3 rounded-xl bg-card border border-border text-text-secondary hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            会話を終了して評価を見る
          </button>
        </main>
      </div>
    );
  }

  if (step === "result" && evaluation) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <header className="mb-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-sm">設定に戻る</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto max-w-2xl mx-auto pb-8 w-full">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl p-6 text-center">
              <h2 className="text-lg text-white/80 mb-2">総合スコア</h2>
              <div className="text-5xl font-bold text-white">
                {evaluation.score}
                <span className="text-2xl text-white/80">/100</span>
              </div>
              <p className="mt-2 text-white/80 text-sm">{selectedScenario.label} の練習結果</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-300" />
                次回まず直す1つ
              </h3>
              <p className="text-text-primary mb-3">{evaluation.oneFocusImprovement}</p>
              <p className="text-xs text-text-secondary">そのまま使える例文</p>
              <p className="text-sm text-amber-200 mt-1">「{evaluation.nextMessageExample}」</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">恋愛会話向け指標</h3>
              <div className="space-y-4">
                {[
                  { label: "質問の質", score: evaluation.curiosityScore },
                  { label: "自己開示", score: evaluation.selfDisclosureScore },
                  { label: "共感", score: evaluation.empathyScore },
                  { label: "押しすぎない進行", score: evaluation.paceScore },
                  { label: "次につなぐ力", score: evaluation.nextStepScore },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-semibold">{item.score}/100</span>
                    </div>
                    <div className="h-2 bg-card-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {evaluation.goodMoments.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  良かった瞬間
                </h3>
                <div className="space-y-4">
                  {evaluation.goodMoments.map((moment, index) => (
                    <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-sm text-text-secondary mb-1">{moment.turn}ターン目</p>
                      <p className="text-text-primary mb-2">「{moment.quote}」</p>
                      <p className="text-sm text-green-400">{moment.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evaluation.partnerTypeTips && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-3">今回の相手タイプ向けヒント</h3>
                <p className="text-text-primary leading-relaxed">{evaluation.partnerTypeTips}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
