import type { Metadata } from "next";
import { ClientBootstrap } from "./ClientBootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talking - 会話の練習",
  description: "初対面の人との会話を練習するアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Talking",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#120f1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#120f1f" />
        <meta name="description" content="初対面の人との会話を練習するアプリ" />
        <meta name="keywords" content="会話,練習,初対面,デート,マッチングアプリ,ロールプレイ,質問" />
        <meta property="og:title" content="Talking - 会話の練習" />
        <meta property="og:description" content="初対面の人との会話を練習するアプリ" />
        <meta property="og:type" content="website" />
      </head>
      <body className="antialiased">
        <ClientBootstrap />
        {children}
      </body>
    </html>
  );
}
