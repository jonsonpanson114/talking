import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Content, Part, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { partnerStyles, roleplayScenarios } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, PartnerStyleId, RoleplayScenarioId } from "@/lib/types";

// Gemini API の初期化
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
// Gemini 3 Flash Preview モデルを使用
const model = genAI.getGenerativeModel({ 
  model: "gemini-3-flash-preview", 
  generationConfig: {
    temperature: 0.8, // 多様性と人間らしさを向上
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1000,
  }
});

const personaPrompts = {
  casual:
    "あなたは親しみやすく、気さくな20代の相手です。友達のような感覚で、リラックスした雰囲気で会話してください。語尾は「〜だよ」「〜かな？」など自然な口語を使い、適度に絵文字（✨, 😊, 🎵など）を交えて親近感を出してください。堅苦しい敬語は禁止です。",
  serious:
    "あなたは誠実で落ち着いた、信頼感のある30代の相手です。丁寧な言葉遣い（です・ます調）を基本としつつ、相手の気持ちに寄り添う聞き上手な姿勢を見せてください。論理的でありながら温かみのある返答を心がけ、過度な絵文字は控えてください。",
  humorous:
    "あなたはユーモアにあふれ、常に会話を明るく盛り上げるタイプです。少しお茶目な冗談や比喩を交えたり、相手の言葉に面白おかしく反応したりしてください。語尾は元気よく「〜だね！」「〜しちゃうかも？」など、表情豊かな印象を与えてください。",
  cool:
    "あなたはクールで、知的かつ主導権を握るタイプです。無駄な言葉を削ぎ落とした簡潔でスマートな話し方をしてください。少しミステリアスな雰囲気を出しつつ、相手の本心をさらっと見抜くような鋭い一言を混ぜると効果的です。甘えすぎず、対等か少しリードする立場で接してください。",
} as const;

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case "start":
        return await handleStartConversation(data);
      case "continue":
        return await handleContinueConversation(data);
      case "evaluate":
        return await handleEvaluateConversation(data);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

function resolveScenario(scenarioId: RoleplayScenarioId) {
  return roleplayScenarios.find((item) => item.id === scenarioId) ?? roleplayScenarios[0];
}

function resolvePartnerStyle(partnerStyleId: PartnerStyleId) {
  return partnerStyles.find((item) => item.id === partnerStyleId) ?? partnerStyles[0];
}

async function handleStartConversation(data: {
  question: string;
  userName: string;
  partnerName: string;
  persona: "casual" | "serious" | "humorous" | "cool";
  scenarioId: RoleplayScenarioId;
  partnerStyleId: PartnerStyleId;
}) {
  const { question, userName, partnerName, persona, scenarioId, partnerStyleId } = data;

  const scenario = resolveScenario(scenarioId);
  const partnerStyle = resolvePartnerStyle(partnerStyleId);

  const systemPrompt = `
【あなたの設定】
${personaPrompts[persona]}
${partnerStyle.promptHint}

あなたの名前は「${partnerName}」です。ユーザーの名前は「${userName}」です。

【シチュエーション】
練習シナリオ: ${scenario.label}
背景: ${scenario.context}
練習目標: ${scenario.objective}

【会話のルール（絶対遵守）】
1. 設定された性格・口調を徹底し、機械的な敬語に逃げないこと。
2. 相手が返信しやすいよう、自然な流れで1つだけ質問を混ぜることが多いですが、毎回である必要はありません。
3. 1メッセージは100文字〜150文字程度。短すぎず、長すぎず。
4. シナリオの状況に即した、リアリティのある会話を展開すること。
5. **文章は必ず最後まで書ききり、中途半端なところで終わらせないこと。**

最初の話題:
${question}
`;

  // Gemini では System Instruction を設定または最初のメッセージに含める
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: "それでは、練習を開始しましょう。最初のメッセージをお願いします。" }
  ]);
  
  const response = result.response;
  return NextResponse.json({
    response: response.text(),
  });
}

async function handleContinueConversation(data: {
  messages: Array<{ role: string; content: string }>;
  userName: string;
  partnerName: string;
  persona: "casual" | "serious" | "humorous" | "cool";
  scenarioId: RoleplayScenarioId;
  partnerStyleId: PartnerStyleId;
}) {
  const { messages, userName, partnerName, persona, scenarioId, partnerStyleId } = data;

  const scenario = resolveScenario(scenarioId);
  const partnerStyle = resolvePartnerStyle(partnerStyleId);

  const systemPrompt = `
【あなたの設定】
${personaPrompts[persona]}
${partnerStyle.promptHint}

あなたの名前は「${partnerName}」です。ユーザーの名前は「${userName}」です。

【シチュエーション】
練習シナリオ: ${scenario.label}
背景: ${scenario.context}

【会話のルール（絶対遵守）】
1. 設定された性格・口調を徹底すること。
2. これまでの会話の流れを汲み、自然にリアクションすること。
3. 相手の話を広げる質問や、共感、自己開示を織り交ぜること。
4. 1メッセージは100文字〜150文字程度を維持すること。
5. 機械的な相槌（「そうですね」「わかりました」など）だけで終わらせないこと。
6. **文章は必ず最後まで完結させ、途切れた状態で送信しないこと。**
`;

  // 履歴の変換 (Gemini 形式: user と model のみ)
  // Gemini の制約として、履歴の最初は必ず "user" ロールである必要がある。
  const rawHistory: Content[] = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const history: Content[] = [];
  if (rawHistory.length > 0 && rawHistory[0].role === "model") {
    // 最初のメッセージが AI から始まっている場合、ダミーのユーザーメッセージを先頭に差し込む
    history.push({ role: "user", parts: [{ text: "それでは、練習を開始しましょう。" }] });
  }
  history.push(...rawHistory);

  // モデルからチャットセッションを開始（システム命令を動的に設定）
  const chat = model.startChat({
    history: history,
  });

  // 実際には systemInstruction は getGenerativeModel 時の設定が望ましいが、
  // 現状の構造を崩さず、最初のメッセージにコンテキストを混ぜる（または sendMessage する）
  // 3-flash-preview では startChat の引数に systemInstruction が通らない場合があるため、
  // ここでは sendMessage にコンテキストを統合するか、別の安全な方法をとる。
  // 安全策として、システムプロンプトをパーツとして追加する。
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage([
    { text: systemPrompt },
    { text: lastMessage }
  ]);
  const response = result.response;

  return NextResponse.json({
    response: response.text(),
  });
}

function clampScore(value: unknown, fallback = 60) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeEvaluation(raw: any): ConversationEvaluation {
  return {
    score: clampScore(raw.score, 65),
    twoWayScore: clampScore(raw.twoWayScore, 60),
    balanceScore: clampScore(raw.balanceScore, 60),
    connectionScore: clampScore(raw.connectionScore, 60),
    naturalnessScore: clampScore(raw.naturalnessScore, 60),
    curiosityScore: clampScore(raw.curiosityScore, 60),
    selfDisclosureScore: clampScore(raw.selfDisclosureScore, 60),
    empathyScore: clampScore(raw.empathyScore, 60),
    paceScore: clampScore(raw.paceScore, 60),
    nextStepScore: clampScore(raw.nextStepScore, 60),
    lengthFeedback:
      raw.lengthFeedback === "too_short" || raw.lengthFeedback === "too_long"
        ? raw.lengthFeedback
        : "good",
    feedback: typeof raw.feedback === "string" ? raw.feedback : "会話は全体として自然に進んでいます。",
    improvements: Array.isArray(raw.improvements) ? (raw.improvements as string[]).slice(0, 3) : [],
    strengths: Array.isArray(raw.strengths) ? (raw.strengths as string[]).slice(0, 3) : [],
    questionCount: typeof raw.questionCount === "number" ? raw.questionCount : 0,
    totalTurns: typeof raw.totalTurns === "number" ? raw.totalTurns : 0,
    oneFocusImprovement:
      typeof raw.oneFocusImprovement === "string"
        ? raw.oneFocusImprovement
        : "次の返答で、相手への質問を1つだけ追加する",
    nextMessageExample:
      typeof raw.nextMessageExample === "string"
        ? raw.nextMessageExample
        : "それいいですね。ちなみに、最近ハマってることってありますか？",
    goodMoments: Array.isArray(raw.goodMoments)
      ? (raw.goodMoments as ConversationEvaluation["goodMoments"]).slice(0, 3)
      : [],
    improvementSuggestions: Array.isArray(raw.improvementSuggestions)
      ? (raw.improvementSuggestions as ConversationEvaluation["improvementSuggestions"]).slice(0, 3)
      : [],
    nextGoals: Array.isArray(raw.nextGoals) ? (raw.nextGoals as string[]).slice(0, 3) : [],
    partnerTypeTips: typeof raw.partnerTypeTips === "string" ? raw.partnerTypeTips : "短文で返しても、相手に一つ質問を添えると会話が続きます。",
  };
}

async function handleEvaluateConversation(data: {
  messages: Array<{ role: string; content: string }>;
  userName: string;
  partnerName: string;
  scenarioId: RoleplayScenarioId;
  partnerStyleId: PartnerStyleId;
}) {
  const { messages, userName, partnerName, scenarioId, partnerStyleId } = data;

  const scenario = resolveScenario(scenarioId);
  const partnerStyle = resolvePartnerStyle(partnerStyleId);

  const prompt = `
あなたは出会い前コミュニケーションのコーチです。
ユーザー「${userName}」と相手「${partnerName}」の会話を、以下シナリオ前提で評価してください。

シナリオ: ${scenario.label}
背景: ${scenario.context}
目標: ${scenario.objective}
相手タイプ: ${partnerStyle.label}（${partnerStyle.description}）

評価基準:
1. curiosityScore: 質問の質・興味の示し方
2. selfDisclosureScore: 自己開示の自然さ
3. empathyScore: 共感の伝え方
4. paceScore: 押しすぎないテンポ
5. nextStepScore: 次につなぐ会話運び
6. twoWayScore, balanceScore, connectionScore, naturalnessScoreも評価

必ず以下のJSONのみを返してください。マークダウンの囲み（\`\`\`json）は不要です。

{
  "score": 0-100,
  "twoWayScore": 0-100,
  "balanceScore": 0-100,
  "connectionScore": 0-100,
  "naturalnessScore": 0-100,
  "curiosityScore": 0-100,
  "selfDisclosureScore": 0-100,
  "empathyScore": 0-100,
  "paceScore": 0-100,
  "nextStepScore": 0-100,
  "lengthFeedback": "too_short" | "too_long" | "good",
  "feedback": "全体講評",
  "improvements": ["改善点"],
  "strengths": ["良かった点"],
  "questionCount": number,
  "totalTurns": number,
  "oneFocusImprovement": "次回最優先で直す1つ",
  "nextMessageExample": "次回そのまま使える自然な一言",
  "goodMoments": [{"turn": number, "quote": "引用", "reason": "理由"}],
  "improvementSuggestions": [{"turn": number, "original": "元", "better": "改善例", "reason": "理由"}],
  "nextGoals": ["次回目標"],
  "partnerTypeTips": "相手タイプに合わせたコツ"
}

会話ログ:
${messages.map((item, index) => `[${index + 1}ターン目] ${item.role}: ${item.content}`).join("\n")}
`;

  // 評価用に、より安定した設定（temperature: 0）と緩和されたセーフティ設定を使用
  const evalModel = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: { temperature: 0 },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  try {
    const result = await evalModel.generateContent(prompt);
    const response = result.response;
    
    let responseText = "";
    try {
      responseText = response.text();
    } catch (e) {
      console.error("Safety block or other issue getting response text:", e);
      // フォールバック: 理由を確認
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY") {
        throw new Error("Evaluation blocked by safety filters. Please try a cleaner conversation.");
      }
      throw e;
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", responseText);
      throw new Error("Failed to find JSON in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const evaluation = normalizeEvaluation(parsed);
    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error("Evaluation API detail error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.text ? await error.response.text() : "N/A"
    });
    return NextResponse.json({ 
      error: "Failed to evaluate conversation",
      detail: error.message 
    }, { status: 500 });
  }
}
