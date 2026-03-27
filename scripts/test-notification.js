// 通知テスト用スクリプト
// 使用方法: npm run test-notification

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('Web Push 通知テストツール');
console.log('='.repeat(50));
console.log('');
console.log('このスクリプトを使用するには、まずアプリで以下の手順を実行してください：');
console.log('');
console.log('1. アプリにアクセス（npm run dev）');
console.log('2. 設定ページ（/settings）へ移動');
console.log('3. 「通知を有効にする」をクリック');
console.log('4. 「バックグラウンド通知を有効にする」をクリック');
console.log('5. ブラウザの開発者ツールを開く');
console.log('6. Application > Local Storage を確認');
console.log('7. talking-notification-settings の値をコピー');
console.log('');
console.log('='.repeat(50));
console.log('');

rl.question('コピーしたJSONを貼り付けてください: ', (answer) => {
  try {
    const settings = JSON.parse(answer);

    if (!settings.pushSubscription) {
      console.error('エラー: pushSubscriptionが見つかりません');
      console.log('先に「バックグラウンド通知を有効にする」をクリックしてください');
      rl.close();
      return;
    }

    const subscription = settings.pushSubscription;

    console.log('');
    console.log('Push Subscriptionを検出しました：');
    console.log('- Endpoint:', subscription.endpoint.substring(0, 50) + '...');
    console.log('- Keys:', subscription.keys ? '存在します' : 'ありません');
    console.log('');
    console.log('ローカルテスト用のcurlコマンド：');
    console.log('');
    console.log(`curl -X POST http://localhost:3000/api/push/send \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '${JSON.stringify({ subscription, data: { title: "テスト通知", body: "これはテストです" } })}'`);
    console.log('');
    console.log('='.repeat(50));
    console.log('');
    console.log('次のステップ：');
    console.log('1. 上記のcurlコマンドを実行');
    console.log('2. 通知が届くことを確認');
    console.log('3. アプリを閉じても通知が届くか確認');
    console.log('');

  } catch (error) {
    console.error('エラー: JSONのパースに失敗しました');
    console.log('正しいJSONを貼り付けてください');
  }

  rl.close();
});
