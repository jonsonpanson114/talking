const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// .env.localからAPIキーを手動で読み込む（dotenvがない場合を想定）
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=([^\s]+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.error("有効な API キーが見つかりません。 .env.local を確認してください。");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// KIの指定通り gemini-3-flash-preview をテスト
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

async function test() {
  try {
    console.log("Testing with model: gemini-3-flash-preview...");
    const result = await model.generateContent("こんにちは、テストメッセージです。一言返して。");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error occurred:", err.message);
    if (err.message.includes("404")) {
      console.log("Hint: モデル名 'gemini-3-flash-preview' が存在しない可能性があります。");
    }
  }
}

test();
