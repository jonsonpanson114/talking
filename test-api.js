
const fetch = require('node-fetch');

async function testRoleplay() {
  const url = 'http://localhost:3000/api/ai';
  
  console.log('--- Testing action: start ---');
  const startRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'start',
      data: {
        question: '最近、一番楽しかった週末はどんな週末でしたか？',
        userName: 'テスト太郎',
        partnerName: 'テスト花子',
        persona: 'casual',
        scenarioId: 'matching-app-first-chat',
        partnerStyleId: 'positive'
      }
    })
  });
  
  const startData = await startRes.json();
  console.log('Start Response:', JSON.stringify(startData, null, 2));
  
  if (startData.response) {
    console.log('\n--- Testing action: continue ---');
    const continueRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'continue',
        data: {
          messages: [
            { role: 'assistant', content: startData.response },
            { role: 'user', content: '先週末は友達とキャンプに行ってきたんだ。すごく星が綺麗だったよ。' }
          ],
          userName: 'テスト太郎',
          partnerName: 'テスト花子',
          persona: 'casual',
          scenarioId: 'matching-app-first-chat',
          partnerStyleId: 'positive'
        }
      })
    });
    
    const continueData = await continueRes.json();
    console.log('Continue Response:', JSON.stringify(continueData, null, 2));
  }
}

testRoleplay().catch(console.error);
