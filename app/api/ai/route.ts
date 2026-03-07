import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { partnerStyles, roleplayScenarios } from "@/lib/data/roleplayScenarios";
import { ConversationEvaluation, PartnerStyleId, RoleplayScenarioId } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const personaPrompts = {
  casual:
    "あなたは親しみやすく、気さくな相手です。リラックスした雰囲気で会話をしてください。絵文字を適度に使っても良いです。",
  serious: "あなたは誠実で、聞き上手な相手です。丁寧で落ち着いた会話をしてください。",
  humorous:
    "あなたは冗談を交えて、楽しい会話をする相手です。適度にユーモアを交えて会話を盛り上げてください。",
  cool:
    "あなたはクールで、主導的な相手です。短めの会話を心がけて、相手をリードするような会話をしてください。",
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
${personaPrompts[persona]}
${partnerStyle.promptHint}

あなたの名前は「${partnerName}」です。ユーザーの名前は「${userName}」です。

練習シナリオ:
- シナリオ名: ${scenario.label}
- 背景: ${scenario.context}
- 練習目標: ${scenario.objective}

この会話は「出会う前の会話練習」です。以下のルールで会話してください。

1. 自然で会話しやすい日本語で話す
2. 相手の反応速度や温度感を現実的に表現する
3. 押しすぎないテンポで、会話を双方向に保つ
4. 1メッセージは長すぎず、次につながる余白を残す
5. シナリオの目標達成に向かう返答をする

最初のメッセージとして、以下の話題で開始してください:
${question}
`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    system: systemPrompt,
    messages: [],
  });

  return NextResponse.json({
    response: message.content[0].type === "text" ? message.content[0].text : "",
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
${personaPrompts[persona]}
${partnerStyle.promptHint}

あなたの名前は「${partnerName}」です。ユーザーの名前は「${userName}」です。

練習シナリオ:
- シナリオ名: ${scenario.label}
- 背景: ${scenario.context}
- 練習目標: ${scenario.objective}

この会話は「出会う前の会話練習」です。以下を守って会話を続けてください。

1. 自然で会話しやすい日本語
2. 必要な場面で質問を返し、双方向性を保つ
3. 押しすぎないテンポを守る（距離を急に詰めない）
4. 相手に安心感が出る受け答えを意識する
5. 次の一手につながる一文を時々入れる（毎回ではない）
`;

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    })),
  });

  return NextResponse.json({
    response: message.content[0].type === "text" ? message.content[0].text : "",
  });
}

function clampScore(value: unknown, fallback = 60) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeEvaluation(raw: Record<string, unknown>): ConversationEvaluation {
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

必ず以下のJSONのみを返してください。

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

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2200,
    system: "JSON以外を出力しないでください。",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : null;

    if (!parsed) {
      throw new Error("Failed to parse evaluation JSON");
    }

    const evaluation = normalizeEvaluation(parsed);
    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Failed to parse evaluation:", error);
    return NextResponse.json({ error: "Failed to evaluate conversation" }, { status: 500 });
  }
}
