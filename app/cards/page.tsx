"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Shuffle, Heart, Lightbulb, Home } from "lucide-react";
import { questions, categories } from "@/lib/data/questions";
import { useLocalStorage, useMouseDownSwipe } from "@/hooks";
import { Question } from "@/lib/types";
import Link from "next/link";

export default function CardsPage() {
  const { progress, saveAnswer, toggleFavorite, isFavorite } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAnswer, setShowAnswer] = useState(false);
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
      setShowAnswer(false);
      setUserAnswer("");
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer("");
    }
  };

  const handleShuffle = () => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const newCurrentIndex = shuffled.findIndex((q) => q.id === currentQuestion.id);
    setCurrentIndex(newCurrentIndex);
    setShowAnswer(false);
    setUserAnswer("");
  };

  const handleSaveAnswer = () => {
    if (userAnswer.trim()) {
      saveAnswer(currentQuestion.id, userAnswer);
      setShowAnswer(true);
    }
  };

  const { onMouseDown, onMouseUp } = useMouseDownSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  const isFav = isFavorite(currentQuestion.id);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-text-secondary mb-4">質問が見つかりません</p>
        <Link
          href="/"
          className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors"
        >
          <Home className="w-4 h-4" />
          トップに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* ヘッダー */}
      <header className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">トップ</span>
        </Link>
        <span className="text-text-secondary text-sm">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </header>

      {/* カテゴリフィルター */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
              setShowAnswer(false);
              setUserAnswer("");
            }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-accent text-white"
                : "bg-card text-text-secondary hover:bg-card-hover"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto">
        <div
          className="relative w-full"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {/* カード */}
          <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl hover:shadow-accent/20 hover:border-accent/50 transition-all duration-300">
            {/* カテゴリバッジ */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs">
                {categories.find((c) => c.id === currentQuestion.category)?.label}
              </span>
            </div>

            {/* 質問 */}
            <h2 className="text-xl md:text-2xl font-bold mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* ヒント表示エリア */}
            {currentQuestion.tips && (
              <div className="mb-4 p-4 rounded-xl bg-card-hover border border-border">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-2 w-full text-left text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm">ヒント</span>
                </button>
                <p className="mt-2 text-sm text-text-secondary">
                  {currentQuestion.tips}
                </p>
              </div>
            )}

            {/* 回答入力エリア */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  自分の返答を考えてみてください
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="ここに返答を入力..."
                  className="w-full min-h-32 px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all resize-none"
                />
              </div>

              {/* 保存済みの回答を表示 */}
              {showAnswer && progress.answeredQuestions[currentQuestion.id] && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <p className="text-sm text-text-secondary mb-1">前回の回答:</p>
                  <p className="text-text-primary">
                    {progress.answeredQuestions[currentQuestion.id]}
                  </p>
                </div>
              )}

              {/* 保存ボタン */}
              <button
                onClick={handleSaveAnswer}
                disabled={!userAnswer.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                回答を保存
              </button>
            </div>
          </div>

          {/* お気に入りボタン */}
          <button
            onClick={() => toggleFavorite(currentQuestion.id)}
            className="absolute -top-3 -right-3 p-3 rounded-full bg-card border border-border hover:bg-card-hover transition-all hover:border-accent"
          >
            <Heart
              className={`w-6 h-6 ${isFav ? "fill-red-500 text-red-500" : "text-text-secondary"}`}
            />
          </button>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-card border border-border hover:bg-card-hover hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShuffle}
            className="p-3 rounded-full bg-card border border-border hover:bg-card-hover hover:border-accent transition-all"
          >
            <Shuffle className="w-5 h-5 text-accent" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className="p-3 rounded-full bg-card border border-border hover:bg-card-hover hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
