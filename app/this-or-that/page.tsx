"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, RotateCcw, ChevronRight } from "lucide-react";
import { thisOrThatQuestions } from "@/lib/data/thisOrThatQuestions";
import Link from "next/link";

type ChoiceSide = "this" | "that";

interface ChoiceHistory {
  questionId: string;
  axis: string;
  side: ChoiceSide;
}

interface AxisInsight {
  axis: string;
  thisCount: number;
  thatCount: number;
  total: number;
  thisRate: number;
  thatRate: number;
  dominant: string;
  confidence: number;
}

interface SavedState {
  currentIndex: number;
  history: ChoiceHistory[];
  isFinished: boolean;
}

const STORAGE_KEY = "this-or-that-progress-v1";

export default function ThisOrThatPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<ChoiceHistory[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const totalQuestions = thisOrThatQuestions.length;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<SavedState>;
      const safeIndex =
        typeof parsed.currentIndex === "number"
          ? Math.max(0, Math.min(parsed.currentIndex, totalQuestions - 1))
          : 0;
      const safeHistory = Array.isArray(parsed.history) ? parsed.history : [];

      setCurrentIndex(safeIndex);
      setHistory(safeHistory);
      setIsFinished(Boolean(parsed.isFinished));
    } catch (error) {
      console.error("Failed to restore progress:", error);
    }
  }, [totalQuestions]);

  useEffect(() => {
    const payload: SavedState = { currentIndex, history, isFinished };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [currentIndex, history, isFinished]);

  const currentQuestion = thisOrThatQuestions[currentIndex];
  const selected = history.find((item) => item.questionId === currentQuestion?.id);

  const handleChoice = (side: ChoiceSide) => {
    if (!currentQuestion) return;

    setHistory((prev) => {
      const exists = prev.some((item) => item.questionId === currentQuestion.id);
      if (exists) {
        return prev.map((item) =>
          item.questionId === currentQuestion.id
            ? { questionId: currentQuestion.id, axis: currentQuestion.axis, side }
            : item
        );
      }

      return [...prev, { questionId: currentQuestion.id, axis: currentQuestion.axis, side }];
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishNow = () => {
    if (history.length === 0) return;
    setIsFinished(true);
  };

  const handleResume = () => {
    const answeredIds = new Set(history.map((item) => item.questionId));
    const nextUnansweredIndex = thisOrThatQuestions.findIndex((question) => !answeredIds.has(question.id));
    if (nextUnansweredIndex >= 0) {
      setCurrentIndex(nextUnansweredIndex);
    }
    setIsFinished(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setHistory([]);
    setIsFinished(false);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const completed = history.length === totalQuestions;
  const showResult = completed || isFinished;

  const insights = useMemo<AxisInsight[]>(() => {
    if (history.length === 0) return [];

    const axisMeta = new Map(
      thisOrThatQuestions.map((q) => [q.axis, { thisTendency: q.thisTendency, thatTendency: q.thatTendency }])
    );

    const grouped = new Map<string, { thisCount: number; thatCount: number; total: number }>();

    for (const answer of history) {
      const current = grouped.get(answer.axis) ?? { thisCount: 0, thatCount: 0, total: 0 };
      const next = {
        thisCount: current.thisCount + (answer.side === "this" ? 1 : 0),
        thatCount: current.thatCount + (answer.side === "that" ? 1 : 0),
        total: current.total + 1,
      };
      grouped.set(answer.axis, next);
    }

    return Array.from(grouped.entries())
      .map(([axis, counts]) => {
        const meta = axisMeta.get(axis);
        const thisRate = Math.round((counts.thisCount / counts.total) * 100);
        const thatRate = Math.round((counts.thatCount / counts.total) * 100);
        const thisWins = thisRate >= thatRate;

        return {
          axis,
          thisCount: counts.thisCount,
          thatCount: counts.thatCount,
          total: counts.total,
          thisRate,
          thatRate,
          dominant: thisWins ? meta?.thisTendency ?? "未定義" : meta?.thatTendency ?? "未定義",
          confidence: Math.abs(thisRate - thatRate),
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }, [history]);

  const strongTrends = insights.filter((item) => item.confidence >= 20).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">トップ</span>
        </Link>
        <span className="text-text-secondary text-sm">
          {showResult ? `${history.length} / ${totalQuestions} 回答済み` : `${currentIndex + 1} / ${totalQuestions}`}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {!showResult ? (
          <div className="w-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
            <p className="text-sm text-text-secondary mb-2">傾向診断・全{totalQuestions}問</p>
            <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.text}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleChoice("this")}
                className={`text-left rounded-2xl p-6 border transition-all hover:scale-[1.01] ${
                  selected?.side === "this"
                    ? "bg-emerald-500/15 border-emerald-400 text-white"
                    : "bg-background border-border hover:border-emerald-400/60"
                }`}
              >
                <p className="text-lg font-semibold">{currentQuestion.thisOption}</p>
                <p className="text-sm text-text-secondary mt-2">こちらに近い</p>
              </button>

              <button
                onClick={() => handleChoice("that")}
                className={`text-left rounded-2xl p-6 border transition-all hover:scale-[1.01] ${
                  selected?.side === "that"
                    ? "bg-sky-500/15 border-sky-400 text-white"
                    : "bg-background border-border hover:border-sky-400/60"
                }`}
              >
                <p className="text-lg font-semibold">{currentQuestion.thatOption}</p>
                <p className="text-sm text-text-secondary mt-2">こちらに近い</p>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-background border border-border text-text-secondary hover:bg-card-hover disabled:opacity-40"
              >
                前へ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFinishNow}
                  disabled={history.length < 3}
                  className="px-4 py-2 rounded-xl bg-background border border-border text-text-secondary hover:bg-card-hover disabled:opacity-40"
                >
                  ここまでで結果を見る
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selected}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold disabled:opacity-40"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-6">
              <h3 className="text-2xl font-bold mb-2">診断結果</h3>
              <p className="text-text-secondary mb-4">
                正解はありません。あなたの選択傾向を可視化しています。
                {!completed && " 途中終了なので、結果は現時点の回答ベースです。"}
              </p>

              {strongTrends.length > 0 ? (
                <div className="space-y-2">
                  {strongTrends.map((trend) => (
                    <div key={trend.axis} className="flex items-start gap-2 text-sm md:text-base">
                      <ChevronRight className="w-4 h-4 mt-1 text-emerald-400" />
                      <p>
                        <span className="font-semibold">{trend.axis}</span>は
                        <span className="text-emerald-300 font-semibold"> {trend.dominant}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">バランス型の傾向です。状況に応じて使い分けられるタイプです。</p>
              )}

              {!completed && (
                <button
                  onClick={handleResume}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold"
                >
                  続きから再開する
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((item) => {
                const axisQuestion = thisOrThatQuestions.find((q) => q.axis === item.axis);
                if (!axisQuestion) return null;

                return (
                  <div key={item.axis} className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm text-text-secondary mb-1">{item.axis}</p>
                    <p className="font-semibold mb-3">{item.dominant}</p>

                    <div className="mb-2 flex justify-between text-xs text-text-secondary">
                      <span>{axisQuestion.thisTendency}</span>
                      <span>{axisQuestion.thatTendency}</span>
                    </div>
                    <div className="h-2 rounded-full bg-background overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
                        style={{ width: `${item.thisRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{item.thisRate}%</span>
                      <span>{item.thatRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <button
            onClick={handleReset}
            className="mt-6 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">最初から診断する</span>
          </button>
        )}
      </main>
    </div>
  );
}
