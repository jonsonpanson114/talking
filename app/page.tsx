"use client";

import Link from "next/link";
import { MessageSquare, Shuffle, GitCompare, List } from "lucide-react";

export default function HomePage() {
  const modes = [
    {
      title: "カードスタイル",
      description: "質問をカードで閲覧、回答を練習",
      icon: <MessageSquare className="w-8 h-8" />,
      href: "/cards",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "AIロールプレイ",
      description: "AI相手と実際に会話を練習",
      icon: <Shuffle className="w-8 h-8" />,
      href: "/roleplay",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "This or That",
      description: "二択クイズで自分を知る",
      icon: <GitCompare className="w-8 h-8" />,
      href: "/this-or-that",
      gradient: "from-pink-500 to-red-500",
    },
    {
      title: "シチュエーション別",
      description: "状況別に質問をブラウズ",
      icon: <List className="w-8 h-8" />,
      href: "/situations",
      gradient: "from-red-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* ヘッダー */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Talking
        </h1>
        <p className="text-center text-text-secondary mt-2">
          初対面の人との会話を練習
        </p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-md mx-auto">
        <div className="grid gap-4">
          {modes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:bg-card-hover transition-all duration-300 hover:border-accent"
            >
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${mode.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
              <div className="relative">
                <div className={`mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br ${mode.gradient}`}>
                  {mode.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">{mode.title}</h2>
                <p className="text-text-secondary text-sm">{mode.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-8 text-center text-text-secondary text-sm">
        <p>© 2024 Talking. All rights reserved.</p>
      </footer>
    </div>
  );
}
