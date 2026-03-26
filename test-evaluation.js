
async function testEvaluation() {
  const url = 'http://localhost:3000/api/ai';
  
  console.log('--- Testing action: evaluate ---');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'evaluate',
      data: {
        messages: [
          { role: 'user', content: 'こんにちは！マッチありがとうございます。' },
          { role: 'assistant', content: 'はじめまして！テスト花子です。よろしくお願いします😊' },
          { role: 'user', content: '週末は何をされていましたか？' },
          { role: 'assistant', content: '先週末はカフェで読書をしていました。のんびりできて良かったです！' }
        ],
        userName: 'テスト太郎',
        partnerName: 'テスト花子',
        scenarioId: 'matching-app-first-chat',
        partnerStyleId: 'positive'
      }
    })
  });
  
  const status = res.status;
  const data = await res.json();
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testEvaluation().catch(console.error);
