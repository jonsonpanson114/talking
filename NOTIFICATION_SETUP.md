# 通知機能セットアップガイド

## Web Push通知（完全バックグラウンド対応）

このアプリでは**Web Push API**を使用して、アプリを閉じていても通知を送信できます。

### 🎯 主な機能

- ✅ **完全バックグラウンド通知**: アプリを閉じていても通知が届く
- ✅ **定時リマインダー**: 毎日設定した時間に練習を促す通知
- ✅ **Android対応**: Chromeなどのブラウザで完全動作
- ⚠️ **iOS制限**: SafariはNotification APIをサポートしていないため非対応

### 📱 動作環境

| 環境 | 動作状況 |
|------|----------|
| Android Chrome | ✅ 完全対応（バックグラウンドでもOK） |
| Desktop Chrome | ✅ 完全対応 |
| iOS Safari | ❌ 非対応（Notification API未実装） |
| Desktop Safari | ✅ 対応（バックグラウンドでは制限あり） |

---

## セットアップ手順

### 1. 環境変数の確認

`.env.local`ファイルに以下の設定が含まれていることを確認してください：

```bash
VAPID_PUBLIC_KEY=BL_TvmPrkvhv7mEtQRoCFzRcB42InhOFABXKRbet2waqIMACqlTK9QEx_eaK4NumvfS_9Hm-JUW7wAliMKADshU
VAPID_PRIVATE_KEY=0Y3-ylzvzCh3RofxwQZzoVVn-NMGbpAdELpmZ9OiIDE
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BL_TvmPrkvhv7mEtQRoCFzRcB42InhOFABXKRbet2waqIMACqlTK9QEx_eaK4NumvfS_9Hm-JUW7wAliMKADshU
```

### 2. Vercelにデプロイ

```bash
# Vercel CLIが未インストールの場合
npm i -g vercel

# デプロイ
vercel --prod
```

### 3. 環境変数をVercelに設定

Vercelダッシュボード、またはCLIで環境変数を設定します：

```bash
vercel env add VAPID_PUBLIC_KEY production
vercel env add VAPID_PRIVATE_KEY production
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
vercel env add CRON_SECRET production
```

### 4. 通知設定

1. アプリにアクセス
2. ホーム画面または設定ページ(/settings)へ移動
3. 「通知を有効にする」をクリック
4. ブラウザの許可ダイアログで「許可」を選択
5. **「バックグラウンド通知を有効にする」**をクリック ← 重要！

### 5. テスト通知

設定ページの「テスト通知を送信」ボタンで動作確認できます。

---

## 定時通知の仕組み

### 方法1: Vercel Cron Jobs（推奨）

`vercel.json`で毎日20時に通知を送信するように設定済み：

```json
{
  "crons": [
    {
      "path": "/api/push/cron",
      "schedule": "0 11 * * *"  // UTC 11:00 = JST 20:00
    }
  ]
}
```

**注意**: Vercel Cron JobsはProプラン以上で利用可能です。

### 方法2: GitHub Actions（無料）

`.github/workflows/daily-notification.yml`でGitHub Actionsを使用した定期実装も設定済み。

**設定手順**:
1. GitHubリポジトリのSecretsに`APP_URL`を追加（例：`https://your-app.vercel.app`）
2. GitHub Actionsを有効化
3. 毎日20:00（JST）に自動実行

### 方法3: 外部Cronサービス

[EasyCron](https://www.easycron.com/)や[cron-job.org](https://cron-job.org/)などで、以下のURLを定時実行：

```
POST https://your-app.vercel.app/api/push/cron
Headers:
  - Content-Type: application/json
  - x-cron-secret: your-secret-key

Body:
{
  "subscriptions": [
    // ユーザーのPush Subscriptionリスト
  ]
}
```

---

## 通知データの管理

### 現状の実装

- **Push Subscription**: localStorageに保存（各ユーザーのブラウザ）
- **課題**: サーバー側では全ユーザーのSubscriptionを管理していない

### 本番環境での実装案

1. **DBにSubscriptionを保存**: Vercel PostgresやSupabaseなどを使用
2. **管理画面**: ユーザーが通知設定を変更できる管理画面
3. **配信管理**: 通知配信の履歴や失敗時のリトライ機能

---

## トラブルシューティング

### 通知が届かない場合

1. **通知許可の確認**
   ```javascript
   // ブラウザコンソールで実行
   console.log(Notification.permission);
   // "granted"であることを確認
   ```

2. **Push Subscriptionの確認**
   ```javascript
   // localStorageを確認
   console.log(localStorage.getItem('talking-notification-settings'));
   // pushSubscriptionが含まれているか確認
   ```

3. **Service Workerの確認**
   ```javascript
   // Service Workerが登録されているか確認
   navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
   ```

4. **VAPIDキーの確認**
   - `.env.local`に正しく設定されているか
   - Vercelの環境変数にも設定されているか

### iOSで通知が届かない

iOS SafariはNotification APIをサポートしていないため、現在の実装では通知機能は利用できません。

代替案：
- PWAとしてインストールしても通知は届かない
- iOSユーザーには「アプリを定期的に開いて練習してください」と案内

### Vercel Cron Jobsが動作しない

- Proプラン以上であることを確認
- `vercel.json`が正しくデプロイされていることを確認
- VercelダッシュボードのCronタブで実行ログを確認

---

## 開発用コマンド

### VAPIDキーの再生成

```bash
node scripts/generate-vapid-keys.js
```

### 手動で通知をテスト

```bash
# テスト通知を送信（curlコマンド）
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "your-endpoint",
      "keys": {
        "p256dh": "your-key",
        "auth": "your-auth"
      }
    }
  }'
```

### Push Subscriptionの確認

ブラウザの開発者ツール > Application > Local Storage で確認できます。

---

## セキュリティについて

- ✅ VAPIDキーは外部に漏れないように管理
- ✅ Cron Jobの実行には`CRON_SECRET`が必要
- ✅ Push Subscriptionのエンドポイントはユーザーごとに異なる
- ⚠️ 本番環境では`CRON_SECRET`を強固なものに変更してください

---

## 今後の改善案

1. **DB連携**: ユーザーSubscriptionをDBで管理
2. **統計機能**: 通知経由の起動数、練習完了率を計測
3. **パーソナライズ**: 時間帯別の通知メッセージ
4. **管理者画面**: 通知配信履歴、ユーザー管理
5. **A/Bテスト**: 通知時間や文言の最適化

---

## ライセンス

この通知機能はMITライセンスの下で提供されています。
