"use client";

import { useState } from "react";
import { Home, Heart, Search, ChevronRight, Sparkles, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questions, categories, presets } from "@/lib/data/questions";
import { useLocalStorage } from "@/hooks";
import Link from "next/link";

export default function SituationsPage() {
  const { progress, toggleFavorite, isFavorite } = useLocalStorage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredQuestions = (() => {
    let result = questions;

    if (selectedCategory !== "all") {
      result = result.filter((q) => q.category === selectedCategory);
    }

    if (selectedPreset) {
      result = presets[selectedPreset as keyof typeof presets] || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.text.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  })();

  const handleToggleFavorite = (questionId: string) => {
    toggleFavorite(questionId);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
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
              Situational Insights
            </span>
          </div>
        </div>
      </header>

      <main className="relative px-6 pb-24 max-w-3xl mx-auto space-y-12">
        <div className="space-y-8">
          {/* 検索エリア */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="質問やタグで検索..."
              className="input-elegant w-full pl-14 pt-4"
            />
          </div>

          {/* カテゴリ選択 */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedPreset(null);
                }}
                className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cat.id && !selectedPreset
                    ? "bg-white text-black"
                    : "glass text-white/30 hover:text-white/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* プリセット */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/10 ml-2">Recommended Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(presets).map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => {
                    setSelectedPreset(presetName);
                    setSelectedCategory("all");
                  }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-semibold transition-all duration-300 ${
                    selectedPreset === presetName
                      ? "bg-white/10 text-white ring-1 ring-white/20"
                      : "glass text-white/30 hover:text-white/60"
                  }`}
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 質問リスト */}
        <div className="space-y-4">
          <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/10 ml-2">Questions Discovery</label>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredQuestions.length === 0 ? (
                <motion.div key="empty" variants={item} className="glass-card p-12 text-center">
                  <p className="text-white/20 font-light italic">No questions found matching your criteria.</p>
                </motion.div>
              ) : (
                filteredQuestions.map((question) => (
                  <motion.div
                    key={question.id}
                    variants={item}
                    layout
                    className={`glass-card overflow-hidden transition-all duration-500 ${
                      expandedQuestion === question.id ? "bg-white/[0.05] ring-1 ring-white/10" : ""
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedQuestion(
                          expandedQuestion === question.id ? null : question.id
                        )
                      }
                      className="w-full p-6 flex items-start gap-4 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-3">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-bold tracking-wider uppercase">
                            {categories.find((c) => c.id === question.category)?.label}
                          </span>
                        </div>
                        <p className="text-lg font-semibold leading-relaxed tracking-tight">
                          {question.text}
                        </p>
                      </div>
                      <ChevronRight
                        className={`flex-shrink-0 w-5 h-5 text-white/10 mt-1 transition-transform duration-500 ${
                          expandedQuestion === question.id ? "rotate-90 text-white/40" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedQuestion === question.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="pt-4 border-t border-white/5 space-y-6">
                            {question.tips && (
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-white/20 mb-2">Inspiration</p>
                                <p className="text-sm text-white/50 font-light leading-relaxed">
                                  {question.tips}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {question.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] font-bold text-white/20"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(question.id);
                                }}
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                  isFavorite(question.id) ? "text-white" : "text-white/20 hover:text-white/40"
                                }`}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isFavorite(question.id) ? "fill-current" : ""
                                  }`}
                                />
                                <span>{isFavorite(question.id) ? "Collected" : "Collect"}</span>
                              </button>
                            </div>

                            {progress.answeredQuestions[question.id] && (
                              <div className="p-4 rounded-xl glass border-white/5 bg-black/20">
                                <p className="text-[9px] uppercase tracking-wider text-white/30 mb-2 font-bold">Past Reflection</p>
                                <p className="text-sm text-white/60 font-light italic">
                                  {progress.answeredQuestions[question.id]}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* お気に入り概要 */}
        {progress.favorites.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-4 h-4 text-white/40 fill-white/10" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Your Collection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions
                .filter((q) => progress.favorites.includes(q.id))
                .slice(0, 4)
                .map((question) => (
                  <div
                    key={question.id}
                    className="glass-card p-6 flex flex-col justify-between"
                  >
                    <p className="text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{question.text}</p>
                    <button
                      onClick={() => handleToggleFavorite(question.id)}
                      className="text-[9px] uppercase tracking-widest font-bold text-white/10 hover:text-white/40 transition-colors self-start"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
            {progress.favorites.length > 4 && (
              <p className="mt-6 text-[10px] text-white/20 text-center uppercase tracking-widest">
                and {progress.favorites.length - 4} more in your collection
              </p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
