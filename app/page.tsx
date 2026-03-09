"use client";

import Link from "next/link";
import { MessageSquare, Sparkles, TrendingUp, Lightbulb, ArrowRight, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const features = [
    {
      id: "cards",
      title: "Conversation Cards",
      description: "質問を選んで会話のきっかけを練習",
      icon: <MessageSquare className="w-5 h-5" />,
      href: "/cards",
      size: "normal",
    },
    {
      id: "roleplay",
      title: "AI Roleplay",
      description: "AIを相手に、実際のシチュエーションを想定した対話トレーニング",
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/roleplay",
      size: "large",
    },
    {
      id: "this-or-that",
      title: "This or That",
      description: "二択の質問で、自分自身の価値観や好みを再発見",
      icon: <Lightbulb className="w-5 h-5" />,
      href: "/this-or-that",
      size: "normal",
    },
    {
      id: "situations",
      title: "Social Situations",
      description: "パーティ、デート、職場など、場面に応じた最適なフレーズを検索",
      icon: <Compass className="w-5 h-5" />,
      href: "/situations",
      size: "normal",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient" />
      
      {/* ヒーローセクション */}
      <header className="relative pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-white/60" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
              Master the Art of Conversation
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter"
          >
            Talking
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed"
          >
            日常の、何気ない「一言」を最高のエッセンスに。<br className="hidden md:block" />
            AIが導く、新しい会話の体験をあなたに。
          </motion.p>
        </div>
      </header>

      {/* メイングリッド */}
      <main className="px-6 pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <div className="bento-grid gap-4 sm:gap-6">
            {features.map((feature) => (
              <motion.div key={feature.id} variants={item} className={feature.size === "large" ? "bento-item-large" : ""}>
                <Link
                  href={feature.href}
                  className="group glass-card h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                      {feature.title}
                    </h2>
                    <p className="text-sm text-white/30 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <div className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* クイック統計 / ヒント */}
          <motion.div variants={item} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-card flex items-start gap-4 p-8">
              <div className="p-3 rounded-xl bg-white/5">
                <Lightbulb className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-white/80">会話のコツ</h3>
                <p className="text-sm text-white/30 font-light leading-relaxed">
                  相手が話した内容の「感情」にフォーカスして詳しく聞くと、自然に会話が深まります。
                </p>
              </div>
            </div>
            <div className="glass-card flex items-start gap-4 p-8">
              <div className="p-3 rounded-xl bg-white/5">
                <TrendingUp className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-white/80">練習の成果</h3>
                <p className="text-sm text-white/30 font-light leading-relaxed">
                  ロールプレイを1日5分続けるだけで、初対面での緊張レベルが平均30%軽減されることがわかっています。
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* フッター */}
      <footer className="py-6 px-4 border-t border-white/[0.04]">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-text-muted text-xs">
            © 2025 Talking
          </p>
        </div>
      </footer>
    </div>
  );
}
