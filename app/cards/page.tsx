"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Shuffle, Heart, Lightbulb, Home, ArrowUpRight, ChevronLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questions, categories } from "@/lib/data/questions";
import { useLocalStorage } from "@/hooks";
import Link from "next/link";

export default function CardsPage() {
  const { progress, saveAnswer, toggleFavorite, isFavorite } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showTips, setShowTips] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const filteredQuestions =
    selectedCategory === "all"
      ? questions
      : questions.filter((q) => q.category === selectedCategory);

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTips(false);
      setUserAnswer("");
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTips(false);
      setUserAnswer("");
    }
  };

  const handleShuffle = () => {
    const shuffledIdx = Math.floor(Math.random() * totalQuestions);
    setCurrentIndex(shuffledIdx);
    setShowTips(false);
    setUserAnswer("");
  };

  const handleSaveAnswer = () => {
    if (userAnswer.trim()) {
      saveAnswer(currentQuestion.id, userAnswer);
      setUserAnswer("");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      
      <header className="relative pt-2 sm:pt-8 pb-1 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-medium uppercase tracking-widest">Studio</span>
          </Link>
          <button
            onClick={handleShuffle}
            className="glass p-2 rounded-xl text-white/40 hover:text-white transition-all duration-300"
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>
      </header>

      <main className="relative px-4 sm:px-6 pb-6 sm:pb-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 lg:gap-12 items-start">
          {/* Main Column */}
          <div className="flex flex-col space-y-2 sm:space-y-8">
            {/* モバイル専用：会話のコツ（カード上部に配置） */}
            <div className="block lg:hidden">
              <div className="glass-card p-2 sm:p-4 border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-2.5 h-2.5 text-white/50" />
                  <h3 className="text-[7px] uppercase tracking-widest font-bold text-white/30">Tip</h3>
                </div>
                <p className="text-[9px] text-white/50 font-medium leading-tight">
                  {[
                    "『何をしたか』より『どう感じたか』を聞くのがコツです。",
                    "相手が言った言葉を繰り返すだけで共感が伝わります。",
                    "『具体的には？』と一歩踏み込むと、話が深まります。",
                  ][currentIndex % 3]}
                </p>
              </div>
            </div>

            {/* カテゴリ選択 */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:pb-6 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1 rounded-full text-[8px] sm:text-[10px] uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-white text-black"
                      : "glass text-white/30 hover:text-white/60 border-transparent shadow-none"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full glass-card p-4 sm:p-10 flex flex-col justify-between border-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-8">
                      <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-white/10">
                        {currentIndex + 1} / {totalQuestions}
                      </span>
                      <button
                        onClick={() => toggleFavorite(currentQuestion.id)}
                        className={`transition-all duration-300 ${isFavorite(currentQuestion.id) ? "text-white scale-110" : "text-white/10 hover:text-white/30"}`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isFavorite(currentQuestion.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <h2 className="text-base sm:text-3xl font-bold mb-3 sm:mb-8 leading-tight tracking-tight">
                      {currentQuestion.text}
                    </h2>

                    {currentQuestion.tips && (
                      <div className="space-y-1.5 sm:space-y-4">
                        <button
                          onClick={() => setShowTips(!showTips)}
                          className="inline-flex items-center gap-2 text-[7px] sm:text-[9px] uppercase tracking-widest font-bold text-white/10 hover:text-white/40 transition-colors"
                        >
                          <Lightbulb className="w-2 h-2 sm:w-3.5 sm:h-3.5" />
                          <span>{showTips ? "Hide" : "Seek"}</span>
                        </button>
                        {showTips && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="glass p-3 sm:p-6 rounded-xl border-white/5"
                          >
                            <p className="text-[10px] sm:text-sm text-white/30 font-light leading-snug">
                              {currentQuestion.tips}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="考えをメモ..."
                        className="input-elegant w-full min-h-[50px] sm:min-h-[100px] resize-none pt-2 text-[11px] sm:text-sm px-4"
                      />
                    </div>
                    
                    {progress.answeredQuestions[currentQuestion.id] && !userAnswer && (
                      <div className="glass p-3 rounded-xl border-white/5 opacity-40">
                        <p className="text-[7px] uppercase tracking-wider text-white/40 mb-1">Previous</p>
                        <p className="text-[10px] font-light leading-snug">{progress.answeredQuestions[currentQuestion.id]}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSaveAnswer}
                      disabled={!userAnswer.trim()}
                      className="btn-primary w-full disabled:opacity-20 flex items-center justify-center gap-2 text-[9px] sm:text-xs uppercase tracking-widest py-2.5 sm:py-3 shadow-lg"
                    >
                      Save
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 sm:mt-8 flex gap-2 sm:gap-4 w-full">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-10 py-2.5 sm:py-3 text-[9px] sm:text-xs uppercase tracking-widest"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalQuestions - 1}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-10 py-2.5 sm:py-3 text-[9px] sm:text-xs uppercase tracking-widest shadow-lg"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Desktop only) */}
          <aside className="hidden lg:block space-y-8 sticky top-8">
            {/* Conversation Tips */}
            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5">
                  <Lightbulb className="w-4 h-4 text-white/60" />
                </div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Conversation Tips</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "感情にフォーカス", content: "『何をしたか』より『どう感じたか』を聞くのがコツです。" },
                  { title: "オウム返しの術", content: "相手が言った重要なキーワードを繰り返すだけで共感が伝わります。" },
                  { title: "具体化の質問", content: "『具体的には？』と一歩踏み込むと、話が深まります。" },
                ].map((tip, i) => (
                  <li key={i} className="space-y-1">
                    <p className="text-[11px] font-bold text-white/60">{tip.title}</p>
                    <p className="text-[11px] text-white/30 font-light leading-relaxed">{tip.content}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Progress Stats */}
            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5">
                  <Sparkles className="w-4 h-4 text-white/60" />
                </div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Your Progress</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-2 px-1">
                    <span className="text-white/20">Answered Questions</span>
                    <span className="text-white/60">{Object.keys(progress.answeredQuestions).length} / {questions.length}</span>
                  </div>
                  <div className="h-1 glass rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(Object.keys(progress.answeredQuestions).length / questions.length) * 100}%` }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Favorite Snapshot */}
            {progress.favorites.length > 0 && (
              <section className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Heart className="w-4 h-4 text-white/60" />
                  </div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Recent Favorites</h3>
                </div>
                <div className="space-y-3">
                  {questions
                    .filter(q => progress.favorites.includes(q.id))
                    .slice(0, 3)
                    .map(q => (
                      <div key={q.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-white/40 font-light line-clamp-2 leading-relaxed">{q.text}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
