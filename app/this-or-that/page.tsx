"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Sparkles, ArrowRight, ChevronLeft, Target, HeartHandshake, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { thisOrThatQuestions } from "@/lib/data/thisOrThatQuestions";
import Link from "next/link";
import {
  AxisInsight,
  ChoiceHistory,
  ChoiceSide,
  THIS_OR_THAT_STORAGE_KEY,
  SavedThisOrThatState,
  buildAxisInsights,
  buildThisOrThatProfile,
} from "@/lib/thisOrThatProfile";

export default function ThisOrThatPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<ChoiceHistory[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const totalQuestions = thisOrThatQuestions.length;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(THIS_OR_THAT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<SavedThisOrThatState>;
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
    const payload: SavedThisOrThatState = { currentIndex, history, isFinished };
    window.localStorage.setItem(THIS_OR_THAT_STORAGE_KEY, JSON.stringify(payload));
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
    window.localStorage.removeItem(THIS_OR_THAT_STORAGE_KEY);
  };

  const completed = history.length === totalQuestions;
  const showResult = completed || isFinished;

  const insights = useMemo<AxisInsight[]>(() => buildAxisInsights(history), [history]);
  const profile = useMemo(() => buildThisOrThatProfile(history), [history]);

  const strongTrends = insights.filter((item) => item.confidence >= 20).slice(0, 3);

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      
      <header className="relative pt-4 sm:pt-8 pb-3 sm:pb-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-white/20">
              Personal Check
            </span>
          </div>
        </div>
      </header>

      <main className="relative px-4 sm:px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="quiz"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={fadeIn}
              className="space-y-6 sm:space-y-12"
            >
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 mb-2 sm:mb-4 block">Question {currentIndex + 1} of {totalQuestions}</span>
                <h1 className="text-xl sm:text-5xl font-bold tracking-tight px-2 sm:px-4 leading-[1.2]">
                  {currentQuestion.text}
                </h1>
                <p className="mt-4 text-xs sm:text-sm text-white/40">
                  今の自分の正解を選べば大丈夫です。全部やり切らなくても、途中の傾向からかなり見えてきます。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-6">
                <button
                  onClick={() => handleChoice("this")}
                  className={`group glass-card p-6 sm:p-10 text-left transition-all duration-700 relative overflow-hidden ${
                    selected?.side === "this" ? "bg-white/[0.08] ring-1 ring-white/20 scale-[1.02]" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
                  }`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <p className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 tracking-tight leading-snug">
                      {currentQuestion.thisOption}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest font-black text-white/10 group-hover:text-white/20 transition-colors">Selection A</p>
                  </div>
                  {selected?.side === "this" && (
                    <motion.div layoutId="selection-glow" className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => handleChoice("that")}
                  className={`group glass-card p-6 sm:p-10 text-left transition-all duration-700 relative overflow-hidden ${
                    selected?.side === "that" ? "bg-white/[0.08] ring-1 ring-white/20 scale-[1.02]" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
                  }`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <p className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 tracking-tight leading-snug">
                      {currentQuestion.thatOption}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest font-black text-white/10 group-hover:text-white/20 transition-colors">Selection B</p>
                  </div>
                  {selected?.side === "that" && (
                    <motion.div layoutId="selection-glow" className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-8">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="btn-secondary w-full sm:w-auto px-8 text-[11px] sm:text-xs uppercase tracking-widest disabled:opacity-0 py-3 sm:py-4"
                >
                  Back
                </button>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  {history.length >= 3 && (
                    <button
                      onClick={handleFinishNow}
                      className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors font-bold py-2"
                    >
                      View Current Insights
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!selected || currentIndex === totalQuestions - 1}
                    className="btn-primary w-full sm:w-auto px-12 text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 py-4 shadow-xl"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {completed && !isFinished && (
                    <button
                      onClick={handleFinishNow}
                      className="btn-primary w-full sm:w-auto px-12 text-[11px] sm:text-xs uppercase tracking-widest py-4 shadow-xl"
                    >
                      Complete
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
              className="space-y-8 sm:space-y-16"
            >
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 mb-2 sm:mb-4 block">Psychometric Profile</span>
                <h1 className="text-3xl sm:text-7xl font-bold tracking-tighter">Vibration Profile</h1>
                <p className="mt-4 text-sm sm:text-base text-white/40">
                  好みの集計ではなく、会話や出会いで出やすい自分の傾向として読める形にしています。
                </p>
              </div>

              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8">
                  <div className="glass-card p-6 sm:p-8 bg-white/[0.04]">
                    <div className="flex items-center gap-3 mb-5">
                      <HeartHandshake className="w-4 h-4 text-white/40" />
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Conversation Archetype</p>
                    </div>
                    <h2 className="text-2xl sm:text-4xl leading-tight">{profile.archetype}</h2>
                    <p className="mt-4 text-sm sm:text-base leading-7 text-white/65">{profile.summary}</p>
                    <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">恋愛・出会いでの活かし方</p>
                      <p className="mt-3 text-sm leading-7 text-white/70">{profile.datingAdvice}</p>
                    </div>
                  </div>

                  <div className="glass-card p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <Compass className="w-4 h-4 text-white/40" />
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Next Best Practice</p>
                    </div>
                    <p className="text-xl sm:text-3xl leading-tight">{profile.recommendedScenarioLabel}</p>
                    <p className="mt-4 text-sm leading-7 text-white/60">
                      いまの傾向だと、この場面を練習すると実戦に直結しやすいです。
                    </p>
                    <Link
                      href={`/roleplay?scenario=${profile.recommendedScenarioId}`}
                      className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 py-4 text-[11px] uppercase tracking-widest"
                    >
                      この場面を練習する
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="glass-card p-6 sm:p-10 bg-white/[0.03]">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white/30" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Core Tendencies</h3>
                  </div>
                  <div className="space-y-4 sm:space-y-8">
                    {strongTrends.length > 0 ? (
                      strongTrends.map((trend) => (
                        <div key={trend.axis} className="space-y-1 sm:space-y-2">
                          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/20 font-bold">{trend.axis}</p>
                          <p className="text-xl sm:text-2xl font-semibold tracking-tight">{trend.dominant}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm sm:text-lg font-light text-white/40 leading-relaxed italic">
                        You exhibit a balanced equilibrium across most dimensions, showing high adaptability to different social contexts.
                      </p>
                    )}
                  </div>
                </div>

                {profile && (
                  <div className="glass-card p-6 sm:p-8">
                    <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-white/20 mb-6 sm:mb-8 text-center sm:text-left">Dating Translation</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">強み</p>
                        <div className="space-y-2">
                          {profile.strengths.map((strength) => (
                            <div key={strength} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                              {strength}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">気をつけたい癖</p>
                        <div className="space-y-2">
                          {profile.cautions.map((caution) => (
                            <div key={caution} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                              {caution}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 sm:p-8">
                <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-white/20 mb-6 sm:mb-8 text-center sm:text-left">Detailed Spectrum</h3>
                <div className="space-y-8 sm:space-y-10">
                  {insights.map((item) => (
                    <div key={item.axis} className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/20">{item.axis}</span>
                        <span className="text-lg sm:text-xl font-bold tracking-tighter">{Math.max(item.thisRate, item.thatRate)}%</span>
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
                      <div className="flex justify-between text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 font-bold">
                        <span className={item.thisRate >= 50 ? "text-white/80" : ""}>{item.thisTendency}</span>
                        <span className={item.thatRate >= 50 ? "text-white/80" : ""}>{item.thatTendency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {profile && (
                <div className="glass-card p-6 sm:p-8">
                  <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-white/20 mb-6">すぐ使える出だし</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {profile.suggestedOpeners.map((opener) => (
                      <div key={opener} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/70">
                        {opener}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                {!completed && (
                  <button
                    onClick={handleResume}
                    className="btn-primary w-full sm:flex-1 py-6 sm:py-8 text-[11px] sm:text-xs uppercase tracking-widest shadow-xl"
                  >
                    Resume Exploration
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="btn-secondary w-full sm:flex-1 py-6 sm:py-8 text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Data</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
