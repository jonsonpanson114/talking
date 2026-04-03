import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Content, HarmCategory, HarmBlockThreshold, SchemaType } from "@google/generative-ai";
import { partnerStyles, roleplayScenarios } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, PartnerStyleId, RoleplayScenarioId } from "@/lib/types";

// Gemini API の初期化 (Version 3.1 Standard準拠)
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// システム指示に基づいた動的なモデル取得 (gemini-3-flash-preview を使用)
function getDynamicModel(systemPrompt: string) {
  return genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview", 
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1000,
    }
  });
}

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

    if (!apiKey) {
      console.error("API Key is missing in environment variables.");
      return NextResponse.json({ 
        error: "API Key not configured", 
        detail: "Vercelの環境変数 GEMINI_API_KEY を設定してください。" 
      }, { status: 500 });
    }

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
  } catch (error: any) {
    console.error("AI API top-level error:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      detail: error.message 
    }, { status: 500 });
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
2. 相手が返信しやすいよう、自然な流れで1つだけ質問を混ぜてください。
3. 1メッセージは100文字〜150文字程度。
4. シナリオの状況に即した、リアリティのある会話を展開すること。
5. **文章は必ず「。」または「？」で完結させ、絶対に途中で切れた状態で出力しないでください。**
6. 会話の末尾が不自然にならないよう、最後まで丁寧に書ききること。
`;

  const model = getDynamicModel(systemPrompt);
  
  const result = await model.generateContent("それでは、練習を開始しましょう。最初のメッセージをお願いします。設定に忠実な、自然な第一声をお願いします。");
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
1. 設定された性格・口調を徹底し、自然にリアクションすること。
2. 相手の話を広げる質問や、共感、自己開示を織り交ぜること。
3. 1メッセージは100文字〜150文字程度を維持すること。
4. 機械的な相槌だけで終わらせないこと。
5. **文章は必ず「。」または「？」で最後まで完結させ、途切れた状態で送信することは厳禁です。**
6. もし考えがまとまらない場合でも、必ず文章の形を整えて終わらせてください。
`;

  const model = getDynamicModel(systemPrompt);

  const rawHistory: Content[] = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const history: Content[] = [];
  if (rawHistory.length > 0 && rawHistory[0].role === "model") {
    history.push({ role: "user", parts: [{ text: "それでは、練習を開始しましょう。" }] });
  }
  history.push(...rawHistory);

  const chat = model.startChat({
    history: history,
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  const response = result.response;

  return NextResponse.json({
    response: response.text(),
  });
}

/**
 * 学習用: 会話の評価 (Response Schema 強制 Version 3.1)
 */
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

シチュエーション: ${scenario.label}
相手タイプ: ${partnerStyle.label} （${partnerStyle.description}）

会話ログ:
${messages.map((item, index) => `[${index + 1}ターン目] ${item.role === 'assistant' ? partnerName : userName}: ${item.content}`).join("\n")}
`;

  // Response Schema の定義 (最先端)
  const evalModel = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: {
      parts: [{ text: "あなたはプロの会話コーチです。提示された会話ログを分析し、ユーザーに対する具体的なフィードバックをJSON形式で返してください。スコアは厳格に付け、改善点は具体的かつ実行可能なものにしてください。" }]
    },
    generationConfig: { 
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER },
          twoWayScore: { type: SchemaType.NUMBER },
          balanceScore: { type: SchemaType.NUMBER },
          connectionScore: { type: SchemaType.NUMBER },
          naturalnessScore: { type: SchemaType.NUMBER },
          curiosityScore: { type: SchemaType.NUMBER },
          selfDisclosureScore: { type: SchemaType.NUMBER },
          empathyScore: { type: SchemaType.NUMBER },
          paceScore: { type: SchemaType.NUMBER },
          nextStepScore: { type: SchemaType.NUMBER },
          lengthFeedback: { type: SchemaType.STRING, enum: ["too_short", "too_long", "good"] },
          feedback: { type: SchemaType.STRING },
          improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          oneFocusImprovement: { type: SchemaType.STRING },
          nextMessageExample: { type: SchemaType.STRING },
          goodMoments: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                turn: { type: SchemaType.NUMBER },
                quote: { type: SchemaType.STRING },
                reason: { type: SchemaType.STRING },
              },
            },
          },
          improvementSuggestions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                turn: { type: SchemaType.NUMBER },
                original: { type: SchemaType.STRING },
                better: { type: SchemaType.STRING },
                reason: { type: SchemaType.STRING },
              },
            },
          },
          nextGoals: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          partnerTypeTips: { type: SchemaType.STRING },
        },
        required: ["score", "feedback", "oneFocusImprovement", "nextMessageExample", "goodMoments", "improvementSuggestions"]
      }
    },
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
    const evaluation = JSON.parse(response.text());
    
    // 足りない項目がある場合の補完 (安定性)
    const normalizedEvaluation: ConversationEvaluation = {
      score: evaluation.score ?? 70,
      twoWayScore: evaluation.twoWayScore ?? 60,
      balanceScore: evaluation.balanceScore ?? 60,
      connectionScore: evaluation.connectionScore ?? 60,
      naturalnessScore: evaluation.naturalnessScore ?? 60,
      curiosityScore: evaluation.curiosityScore ?? 60,
      selfDisclosureScore: evaluation.selfDisclosureScore ?? 60,
      empathyScore: evaluation.empathyScore ?? 60,
      paceScore: evaluation.paceScore ?? 70,
      nextStepScore: evaluation.nextStepScore ?? 60,
      lengthFeedback: evaluation.lengthFeedback ?? "good",
      feedback: evaluation.feedback ?? "会話は良好に進んでいます。",
      improvements: evaluation.improvements ?? [],
      strengths: evaluation.strengths ?? [],
      questionCount: evaluation.questionCount ?? 0,
      totalTurns: messages.length,
      oneFocusImprovement: evaluation.oneFocusImprovement ?? "相手への興味を示し続けましょう。",
      nextMessageExample: evaluation.nextMessageExample ?? "楽しそうですね！それについて詳しく教えてください。",
      goodMoments: evaluation.goodMoments ?? [],
      improvementSuggestions: evaluation.improvementSuggestions ?? [],
      nextGoals: evaluation.nextGoals ?? [],
      partnerTypeTips: evaluation.partnerTypeTips ?? "相手のペースに合わせて会話を広げましょう。",
    };

    return NextResponse.json({ evaluation: normalizedEvaluation });
  } catch (error: any) {
    console.error("Evaluation API Detail Error:", error);
    
    // 完全な失敗を避け、何かしらのレスポンスを返す
    return NextResponse.json({ 
      error: "Evaluation failed",
      detail: error.message,
    }, { status: 500 });
  }
}
