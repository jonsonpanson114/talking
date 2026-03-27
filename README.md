# Talking - 会話練習アプリ

AIが導く、新しい会話の体験。初対面の人との会話を練習するWebアプリケーション。

## ✨ 主な機能

- **Conversation Cards**: 質問を選んで会話のきっかけを練習
- **AI Roleplay**: AIを相手に、実際のシチュエーションを想定した対話トレーニング
- **This or That**: 二択の質問で、自分自身の価値観や好みを再発見
- **Social Situations**: パーティ、デート、職場など、場面に応じた最適なフレーズを検索
- **🔔 通知機能**: 毎日設定した時間に練習リマインダー（アプリを閉じていても通知が届く！）

## 🚀 クイックスタート

```bash
# インストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.localにGEMINI_API_KEYを設定してください

# 開発サーバー起動
npm run dev

# ブラウザでアクセス
open http://localhost:3000
```

## 📱 PWAとしてインストール

このアプリはPWA（Progressive Web App）対応です。スマートフォンのホーム画面に追加して、ネイティブアプリのように使用できます。

### インストール方法

1. Chrome/Safariでアプリを開く
2. メニューから「ホーム画面に追加」を選択
3. インストール完了

## 🔔 通知機能セットアップ

完全バックグラウンド対応の通知機能を使用するには、追加のセットアップが必要です。

詳細は[NOTIFICATION_SETUP.md](NOTIFICATION_SETUP.md)をご覧ください。

### 概要

1. `.env.local`にVAPIDキーを設定（既に生成済み）
2. アプリの設定ページで「バックグラウンド通知を有効にする」をクリック
3. Vercelにデプロイして、Cron Jobsを有効化

これで、アプリを閉じていても毎日20時に通知が届きます！

## 🛠️ 技術スタック

- **Framework**: Next.js 14.2 (App Router)
- **UI**: React 18.3, Tailwind CSS, Framer Motion
- **AI**: Google Gemini 3 Flash Preview
- **PWA**: next-pwa, Service Worker
- **通知**: Web Push API, VAPID

## 📁 プロジェクト構造

```
app/
├── api/
│   ├── ai/route.ts          # AIチャットAPI
│   └── push/                # Web Push API
│       ├── subscribe/       # Push Subscription登録
│       ├── send/            # 通知送信
│       └── cron/            # 定時通知（Cron Jobs用）
├── cards/page.tsx           # Conversation Cards
├── roleplay/page.tsx        # AI Roleplay
├── this-or-that/page.tsx    # This or That
├── situations/page.tsx      # Social Situations
└── settings/page.tsx        # 設定ページ
components/
├── NotificationSettings.tsx # 通知設定UI
└── NotificationPermission.tsx # 通知許可プロンプト
hooks/
├── useNotifications.ts      # 通知フック
└── useServiceWorker.ts      # Service Workerフック
lib/
├── notifications.ts         # 通知ヘルパー
├── storage.ts               # LocalStorage管理
└── types.ts                 # 型定義
public/
├── sw-custom.js             # カスタムService Worker
└── manifest.json            # PWAマニフェスト
```

## 🌐 デプロイ

### Vercel（推奨）

```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel --prod
```

環境変数の設定を忘れずに：
- `GEMINI_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `CRON_SECRET`

## 🧪 テスト

```bash
# TypeScript型チェック
npx tsc --noEmit

# リント
npm run lint

# ビルド
npm run build

# VAPIDキー生成（通知機能用）
node scripts/generate-vapid-keys.js
```

## 📊 通知機能の仕組み

### Service Workerのみ（以前の実装）
```
アプリが起動している必要がある
└─ Service Workerが動作
    └─ 60秒ごとのチェックで通知
```

### Web Push API（現在の実装）
```
サーバーから直接プッシュ
└─ Push Service（Googleなど）
    └─ ブラウザが起動していれば通知
        └─ アプリが完全に閉じていてもOK！
```

## 🔧 トラブルシューティング

### 通知が届かない場合

1. 通知許可が「granted」になっているか確認
2. 「バックグラウンド通知を有効にする」をクリックしているか確認
3. VAPIDキーが正しく設定されているか確認
4. サービスワーカーが登録されているか確認

詳細は[NOTIFICATION_SETUP.md](NOTIFICATION_SETUP.md)を参照してください。

## 📝 ライセンス

MIT License

## 🤝 貢献

バグレポートやプルリクエストは大歓迎です！

---

Made with ❤️ using Next.js and AI
