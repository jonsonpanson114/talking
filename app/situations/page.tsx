"use client";

import { useState } from "react";
import { Home, Heart, Search, ChevronRight } from "lucide-react";
import { questions, categories, presets } from "@/lib/data/questions";
import { useLocalStorage } from "@/hooks";
import { Question } from "@/lib/types";
import Link from "next/link";

export default function SituationsPage() {
  const { progress, toggleFavorite, isFavorite } = useLocalStorage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // フィルタリング
  const filteredQuestions = (() => {
    let result = questions;

    // カテゴリフィルター
    if (selectedCategory !== "all") {
      result = result.filter((q) => q.category === selectedCategory);
    }

    // プリセットフィルター
    if (selectedPreset) {
      result = presets[selectedPreset as keyof typeof presets] || [];
    }

    // 検索フィルター
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

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* ヘッダー */}
      <header className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">トップ</span>
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto">
        {/* 検索エリア */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="質問を検索..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all"
          />
        </div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedPreset(null);
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

        {/* プリセット */}
        <div className="mb-6">
          <h3 className="text-sm text-text-secondary mb-3">プリセット</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(presets).map((presetName) => (
              <button
                key={presetName}
                onClick={() => {
                  setSelectedPreset(presetName);
                  setSelectedCategory("all");
                }}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedPreset === presetName
                    ? "bg-purple-500 text-white"
                    : "bg-card text-text-secondary hover:bg-card-hover border border-border"
                }`}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>

        {/* 質問リスト */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">質問が見つかりません</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:bg-card-hover transition-all"
              >
                {/* ヘッダー */}
                <button
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === question.id ? null : question.id
                    )
                  }
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div className="flex-1">
                    <p className="text-lg font-semibold mb-2">
                      {question.text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">
                        {categories.find((c) => c.id === question.category)?.label}
                      </span>
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-card-hover text-text-secondary text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight
                    className={`flex-shrink-0 w-5 h-5 text-text-secondary transition-transform ${
                      expandedQuestion === question.id ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* 展開コンテンツ */}
                {expandedQuestion === question.id && (
                  <div className="p-4 border-t border-border">
                    {question.tips && (
                      <div className="mb-4">
                        <p className="text-sm text-text-secondary mb-2">ヒント:</p>
                        <p className="text-text-primary text-sm leading-relaxed">
                          {question.tips}
                        </p>
                      </div>
                    )}

                    {/* お気に入りボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(question.id);
                      }}
                      className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite(question.id) ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      <span className="text-sm">
                        {isFavorite(question.id) ? "お気に入り済み" : "お気に入りに追加"}
                      </span>
                    </button>

                    {/* 保存済みの回答があれば表示 */}
                    {progress.answeredQuestions[question.id] && (
                      <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/30">
                        <p className="text-sm text-text-secondary mb-1">前回の回答:</p>
                        <p className="text-text-primary">
                          {progress.answeredQuestions[question.id]}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* お気に入り一覧 */}
        {progress.favorites.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              お気に入り
            </h3>
            <div className="space-y-3">
              {questions
                .filter((q) => progress.favorites.includes(q.id))
                .map((question) => (
                  <div
                    key={question.id}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <p className="font-semibold mb-2">{question.text}</p>
                    <button
                      onClick={() => handleToggleFavorite(question.id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                      <span className="text-sm">削除</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
