"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, RotateCcw, ChevronRight, Sparkles, ArrowRight, ChevronLeft, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      
      <header className="relative pt-12 pb-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">Back to Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/20">
              Personal Vibration Check
            </span>
          </div>
        </div>
      </header>

      <main className="relative px-6 pb-24 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="quiz"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={fadeIn}
              className="space-y-12"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 mb-4 block">Question {currentIndex + 1} of {totalQuestions}</span>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight px-4 leading-[1.2]">
                  {currentQuestion.text}
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">
                <button
                  onClick={() => handleChoice("this")}
                  className={`group glass-card p-10 text-left transition-all duration-700 relative overflow-hidden ${
                    selected?.side === "this" ? "bg-white/[0.08] ring-1 ring-white/20 scale-[1.02]" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
                  }`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <p className="text-xl md:text-2xl font-bold mb-4 tracking-tight leading-snug">
                      {currentQuestion.thisOption}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-white/10 group-hover:text-white/20 transition-colors">Selection A</p>
                  </div>
                  {selected?.side === "this" && (
                    <motion.div layoutId="selection-glow" className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => handleChoice("that")}
                  className={`group glass-card p-10 text-left transition-all duration-700 relative overflow-hidden ${
                    selected?.side === "that" ? "bg-white/[0.08] ring-1 ring-white/20 scale-[1.02]" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
                  }`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <p className="text-xl md:text-2xl font-bold mb-4 tracking-tight leading-snug">
                      {currentQuestion.thatOption}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-white/10 group-hover:text-white/20 transition-colors">Selection B</p>
                  </div>
                  {selected?.side === "that" && (
                    <motion.div layoutId="selection-glow" className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-12">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="btn-secondary px-8 text-xs uppercase tracking-widest disabled:opacity-0"
                >
                  Back
                </button>

                <div className="flex gap-4">
                  {history.length >= 3 && (
                    <button
                      onClick={handleFinishNow}
                      className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors font-bold"
                    >
                      View Current Insights
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!selected || currentIndex === totalQuestions - 1}
                    className="btn-primary px-12 text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {completed && !isFinished && (
                    <button
                      onClick={handleFinishNow}
                      className="btn-primary px-12 text-xs uppercase tracking-widest"
                    >
                      Complete Selection
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={fadeIn}
              className="space-y-16"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 mb-4 block">Psychometric Profile</span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Vibration Profile</h1>
              </div>

              {/* 主要な傾向 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10 bg-white/[0.03]">
                  <div className="flex items-center gap-4 mb-8">
                    <Target className="w-5 h-5 text-white/30" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Core Tendencies</h3>
                  </div>
                  <div className="space-y-8">
                    {strongTrends.length > 0 ? (
                      strongTrends.map((trend) => (
                        <div key={trend.axis} className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">{trend.axis}</p>
                          <p className="text-2xl font-semibold tracking-tight">{trend.dominant}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-lg font-light text-white/40 leading-relaxed italic">
                        You exhibit a balanced equilibrium across most dimensions, showing high adaptability to different social contexts.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-8">Detailed Spectrum</h3>
                    <div className="space-y-10">
                      {insights.map((item) => (
                        <div key={item.axis} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{item.axis}</span>
                            <span className="text-xl font-bold tracking-tighter">{Math.max(item.thisRate, item.thatRate)}%</span>
                          </div>
                          <div className="h-1 glass rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.thisRate}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-white absolute left-0"
                            />
                            <div className="w-[1px] h-full bg-white/10 absolute left-1/2" />
                          </div>
                          <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/40 font-bold">
                            <span className={item.thisRate >= 50 ? "text-white/80" : ""}>{thisOrThatQuestions.find(q => q.axis === item.axis)?.thisTendency}</span>
                            <span className={item.thatRate >= 50 ? "text-white/80" : ""}>{thisOrThatQuestions.find(q => q.axis === item.axis)?.thatTendency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                {!completed && (
                  <button
                    onClick={handleResume}
                    className="btn-primary flex-1 py-8 text-xs uppercase tracking-widest"
                  >
                    Resume Exploration
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="btn-secondary flex-1 py-8 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Data Stream</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
