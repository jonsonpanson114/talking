"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Shuffle, Heart, Lightbulb, Home, ArrowUpRight, ChevronLeft } from "lucide-react";
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
      
      <header className="relative pt-8 pb-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">Back to Studio</span>
          </Link>
          <button
            onClick={handleShuffle}
            className="glass p-3 rounded-2xl text-white/40 hover:text-white transition-all duration-300"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative px-6 pb-16 max-w-2xl mx-auto flex flex-col">
        {/* カテゴリ選択 */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-white text-black"
                  : "glass text-white/30 hover:text-white/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full glass-card p-8 md:p-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">
                    Question {currentIndex + 1} / {totalQuestions}
                  </span>
                  <button
                    onClick={() => toggleFavorite(currentQuestion.id)}
                    className={`transition-all duration-300 ${isFavorite(currentQuestion.id) ? "text-white scale-125" : "text-white/10 hover:text-white/30"}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(currentQuestion.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-[1.3] tracking-tight">
                  {currentQuestion.text}
                </h2>

                {currentQuestion.tips && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowTips(!showTips)}
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-white/60 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showTips ? "Close Inspiration" : "Seek Inspiration"}</span>
                    </button>
                    {showTips && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="glass p-6 rounded-2xl border-white/5"
                      >
                        <p className="text-sm text-white/40 font-light leading-relaxed">
                          {currentQuestion.tips}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/10 ml-2">Internal Dialogue</label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="自分の考えや返答をメモ..."
                    className="input-elegant w-full min-h-[100px] resize-none pt-4"
                  />
                </div>
                
                {progress.answeredQuestions[currentQuestion.id] && !userAnswer && (
                  <div className="glass p-4 rounded-xl border-white/5 opacity-40">
                    <p className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Previous Note</p>
                    <p className="text-xs font-light">{progress.answeredQuestions[currentQuestion.id]}</p>
                  </div>
                )}

                <button
                  onClick={handleSaveAnswer}
                  disabled={!userAnswer.trim()}
                  className="btn-primary w-full disabled:opacity-20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  Save Reflection
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-4 w-full">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-10"
            >
              <span className="text-xs uppercase tracking-widest">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
