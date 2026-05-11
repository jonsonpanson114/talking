import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  Content,
  HarmCategory,
  HarmBlockThreshold,
  SchemaType,
} from "@google/generative-ai";
import { partnerStyles, roleplayScenarios } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, PartnerStyleId, RoleplayScenarioId } from "@/lib/types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

function getDynamicModel(systemPrompt: string) {
  return genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1000,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
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

function resolveScenario(scenarioId: RoleplayScenarioId) {
  return roleplayScenarios.find((item) => item.id === scenarioId) ?? roleplayScenarios[0];
}

function resolvePartnerStyle(partnerStyleId: PartnerStyleId) {
  return partnerStyles.find((item) => item.id === partnerStyleId) ?? partnerStyles[0];
}

function isRetriableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("503") || message.includes("429") || message.includes("Service Unavailable");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetriableGeminiError(error) || attempt === retries) {
        throw error;
      }
      await sleep(400 * (attempt + 1));
    }
  }
  throw lastError;
}

function normalizeAssistantResponse(text: string, fallback: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return fallback;
  if (/[。！？!?]$/.test(trimmed)) return trimmed;
  console.warn("AI response was likely truncated or incomplete:", trimmed);
  return `${trimmed}。`;
}

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API Key not configured",
          detail: "Vercelの環境変数 GEMINI_API_KEY を設定してください。",
        },
        { status: 500 }
      );
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
    return NextResponse.json(
      {
        error: "Failed to process request",
        detail: error?.message ?? "unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleStartConversation(data: {
  question: string;
  userName: string;
  partnerName: string;
  persona: "casual" | "serious" | "humorous" | "cool";
  scenarioId: RoleplayScenarioId;
  partnerStyleId: PartnerStyleId;
}) {
  const { userName, partnerName, persona, scenarioId, partnerStyleId } = data;

  const scenario = resolveScenario(scenarioId);
  const partnerStyle = resolvePartnerStyle(partnerStyleId);

  const systemPrompt = `
【あなたの設定】
${personaPrompts[persona]}
${partnerStyle.promptHint}

あなた（AI）は女性で、名前は「${partnerName}」です。
ユーザー（人間）は男性で、名前は「${userName}」です。
女性としての魅力を保ちつつ、設定された性格で自然に振る舞ってください。

【シチュエーション】
練習シナリオ: ${scenario.label}
背景: ${scenario.context}
練習目標: ${scenario.objective}

【会話のルール（絶対遵守）】
1. 設定された性格・口調を徹底し、機械的な敬語に逃げないこと。
2. 相手が返信しやすいよう、自然な流れで1つだけ質問を混ぜてください。
3. 1メッセージは100文字〜200文字程度を目安とし、必ず文章を完結させてください。
4. シナリオの状況に即した、リアリティのある会話を展開すること。
5. 文章は必ず「。」または「？」で完結させること。
`;

  try {
    const model = getDynamicModel(systemPrompt);
    const result = await withRetry(() =>
      model.generateContent(
        "それでは、練習を開始しましょう。最初のメッセージをお願いします。設定に忠実な、自然な第一声をお願いします。"
      )
    );
    const response = normalizeAssistantResponse(
      result.response.text(),
      `はじめまして、${userName}さん。マッチありがとうございます。最近ちょっと気分が上がった出来事ってありましたか？`
    );
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Start conversation failed:", error);
    return NextResponse.json({
      response:
        `はじめまして、${userName}さん。マッチありがとうございます。最近ちょっと気分が上がった出来事ってありましたか？`,
      fallback: true,
    });
  }
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

あなた（AI）は女性で、名前は「${partnerName}」です。
ユーザー（人間）は男性で、名前は「${userName}」です。
女性としての魅力を保ちつつ、設定された性格で自然に振る舞ってください。

【シチュエーション】
練習シナリオ: ${scenario.label}
背景: ${scenario.context}

【会話のルール（絶対遵守）】
1. 設定された性格・口調を徹底し、自然にリアクションすること。
2. 相手の話を広げる質問や、共感、自己開示を織り交ぜること。
3. 1メッセージは100文字〜200文字程度を目安とし、必ず最後まで完結させてください。途中で切れることは許されません。
4. 文章は必ず「。」または「？」で最後まで完結させること。
`;

  try {
    const model = getDynamicModel(systemPrompt);

    const rawHistory: Content[] = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const history: Content[] = [];
    if (rawHistory.length > 0 && rawHistory[0].role === "model") {
      history.push({ role: "user", parts: [{ text: "それでは、練習を開始しましょう。" }] });
    }
    history.push(...rawHistory);

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    let result = await withRetry(() => chat.sendMessage(lastMessage));
    let rawText = result.response.text();

    // もし極端に短いか、途切れているように見えたら一度だけリトライ
    if (rawText.length < 50 || !/[。！？!?]$/.test(rawText.trim())) {
      console.warn("Response seems incomplete or too short, attempting one-time nudge retry...");
      result = await withRetry(() =>
        chat.sendMessage(
          "（今の返信が少し中途半端か短すぎたようです。設定に忠実に、100文字以上で最後まで完結した文章でもう一度返信してください）"
        )
      );
      rawText = result.response.text();
    }

    const response = normalizeAssistantResponse(
      rawText,
      "なるほど、それはいいですね。もう少し詳しく聞きたいです。特にどんなところが一番印象に残りましたか？"
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Continue conversation failed:", error);
    return NextResponse.json({
      response:
        "なるほど、それはいいですね。もう少し詳しく聞きたいです。特にどんなところが一番印象に残りましたか？",
      fallback: true,
    });
  }
}

function defaultEvaluation(messages: Array<{ role: string; content: string }>): ConversationEvaluation {
  return {
    score: 65,
    twoWayScore: 60,
    balanceScore: 60,
    connectionScore: 60,
    naturalnessScore: 60,
    curiosityScore: 60,
    selfDisclosureScore: 60,
    empathyScore: 60,
    paceScore: 65,
    nextStepScore: 60,
    lengthFeedback: "good",
    feedback: "一時的に詳細評価エンジンへ接続できなかったため、簡易評価を返しています。",
    improvements: ["一文だけでも相手への質問を添える"],
    strengths: ["会話を継続しようとする姿勢がある"],
    questionCount: 0,
    totalTurns: messages.length,
    oneFocusImprovement: "次の返答で、相手に具体質問を1つ入れる",
    nextMessageExample: "それいいですね。もう少し詳しく聞いてもいいですか？",
    goodMoments: [],
    improvementSuggestions: [],
    nextGoals: ["質問と自己開示を1:1で入れる"],
    partnerTypeTips: "短くてもいいので、相手の話題を拾う一言を先に置くと自然です。",
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

シチュエーション: ${scenario.label}
相手タイプ: ${partnerStyle.label} （${partnerStyle.description}）

会話ログ:
${messages
  .map(
    (item, index) =>
      `[${index + 1}ターン目] ${item.role === "assistant" ? partnerName : userName}: ${item.content}`
  )
  .join("\n")}
`;

  const evalModel = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction:
      "あなたはプロの会話コーチです。会話ログを分析し、具体的な改善提案をJSONで返してください。",
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
          lengthFeedback: { type: SchemaType.STRING },
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
      },
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  try {
    const result = await withRetry(() => evalModel.generateContent(prompt));
    const response = result.response;
    const evaluation = JSON.parse(response.text());

    const normalizedEvaluation: ConversationEvaluation = {
      ...defaultEvaluation(messages),
      ...evaluation,
      totalTurns: messages.length,
      lengthFeedback:
        evaluation.lengthFeedback === "too_short" ||
        evaluation.lengthFeedback === "too_long" ||
        evaluation.lengthFeedback === "good"
          ? evaluation.lengthFeedback
          : "good",
    };

    return NextResponse.json({ evaluation: normalizedEvaluation });
  } catch (error: any) {
    console.error("Evaluation API Detail Error:", error);
    return NextResponse.json({ evaluation: defaultEvaluation(messages), fallback: true });
  }
}
