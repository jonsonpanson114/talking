import { ThisOrThatQuestion } from "@/lib/types";
import { thisOrThatQuestions } from "@/lib/data/thisOrThatQuestions";

export type ChoiceSide = "this" | "that";

export interface ChoiceHistory {
  questionId: string;
  axis: string;
  side: ChoiceSide;
}

export interface AxisInsight {
  axis: string;
  thisCount: number;
  thatCount: number;
  total: number;
  thisRate: number;
  thatRate: number;
  dominant: string;
  confidence: number;
  thisTendency: string;
  thatTendency: string;
}

export interface SavedThisOrThatState {
  currentIndex: number;
  history: ChoiceHistory[];
  isFinished: boolean;
}

export interface ThisOrThatProfile {
  archetype: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  datingAdvice: string;
  recommendedScenarioId: string;
  recommendedScenarioLabel: string;
  suggestedOpeners: string[];
}

export const THIS_OR_THAT_STORAGE_KEY = "this-or-that-progress-v1";

const SCENARIO_LABELS: Record<string, string> = {
  "matching-app-first-chat": "マッチ後の初回チャット",
  "date-scheduling": "日程調整のやり取り",
  "before-first-date": "初対面前日のやり取り",
  "after-first-date": "初デート後の感想チャット",
  "hobby-deep-dive": "共通の趣味についての深掘り",
  "recovery-chat": "少し気まずい沈黙の打破",
  "professional-networking": "社会人同士の交流",
};

function findRepresentativeQuestion(axis: string): ThisOrThatQuestion | undefined {
  return thisOrThatQuestions.find((question) => question.axis === axis);
}

export function loadThisOrThatState(): SavedThisOrThatState {
  if (typeof window === "undefined") {
    return { currentIndex: 0, history: [], isFinished: false };
  }

  try {
    const raw = window.localStorage.getItem(THIS_OR_THAT_STORAGE_KEY);
    if (!raw) {
      return { currentIndex: 0, history: [], isFinished: false };
    }

    const parsed = JSON.parse(raw) as Partial<SavedThisOrThatState>;
    return {
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      isFinished: Boolean(parsed.isFinished),
    };
  } catch {
    return { currentIndex: 0, history: [], isFinished: false };
  }
}

export function buildAxisInsights(history: ChoiceHistory[]): AxisInsight[] {
  if (history.length === 0) return [];

  const grouped = new Map<string, { thisCount: number; thatCount: number; total: number }>();

  for (const answer of history) {
    const current = grouped.get(answer.axis) ?? { thisCount: 0, thatCount: 0, total: 0 };
    grouped.set(answer.axis, {
      thisCount: current.thisCount + (answer.side === "this" ? 1 : 0),
      thatCount: current.thatCount + (answer.side === "that" ? 1 : 0),
      total: current.total + 1,
    });
  }

  return Array.from(grouped.entries())
    .map(([axis, counts]) => {
      const source = findRepresentativeQuestion(axis);
      const thisRate = Math.round((counts.thisCount / counts.total) * 100);
      const thatRate = Math.round((counts.thatCount / counts.total) * 100);

      return {
        axis,
        thisCount: counts.thisCount,
        thatCount: counts.thatCount,
        total: counts.total,
        thisRate,
        thatRate,
        dominant: thisRate >= thatRate ? source?.thisTendency ?? "未定義" : source?.thatTendency ?? "未定義",
        confidence: Math.abs(thisRate - thatRate),
        thisTendency: source?.thisTendency ?? "",
        thatTendency: source?.thatTendency ?? "",
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

export function buildThisOrThatProfile(history: ChoiceHistory[]): ThisOrThatProfile | null {
  const insights = buildAxisInsights(history);
  if (insights.length === 0) return null;

  const byAxis = new Map(insights.map((item) => [item.axis, item]));
  const social = byAxis.get("社交スタンス");
  const tempo = byAxis.get("行動テンポ");
  const communication = byAxis.get("伝達スタイル");
  const planning = byAxis.get("計画性");
  const recovery = byAxis.get("回復スタイル");
  const curiosity = byAxis.get("新規志向");

  const prefersDirect = communication ? communication.thisRate >= communication.thatRate : false;
  const prefersCare = communication ? communication.thatRate > communication.thisRate : false;
  const fastTempo = tempo ? tempo.thisRate >= tempo.thatRate : false;
  const socialLead = social ? social.thisRate >= social.thatRate : false;
  const structured = planning ? planning.thisRate >= planning.thatRate : false;
  const noveltySeeking = curiosity ? curiosity.thisRate >= curiosity.thatRate : false;
  const quietRecovery = recovery ? recovery.thatRate > recovery.thisRate : false;

  if (prefersCare && structured) {
    return {
      archetype: "安心感をつくる設計型",
      summary: "相手の温度を見ながら、丁寧に信頼を積むタイプです。初対面でも雑になりにくく、会う前のやり取りで安心感を出しやすい傾向があります。",
      strengths: [
        "日程調整や前日の連絡で、相手が構えにくい",
        "言い方を整えられるので、押しすぎに見えにくい",
        "会話の流れを前もって考えるのが得意",
      ],
      cautions: [
        "考えすぎて返信が少し遅くなりやすい",
        "無難にまとまりすぎると、印象が薄くなる",
      ],
      datingAdvice: "正しさよりも少しだけ熱量を見せると、丁寧さが魅力として伝わりやすくなります。",
      recommendedScenarioId: "before-first-date",
      recommendedScenarioLabel: SCENARIO_LABELS["before-first-date"],
      suggestedOpeners: [
        "明日よろしくね。楽しみにしてるよ。ちなみに甘いものって結構好き？",
        "会う前に少しだけ安心材料ほしくて、好きなお店の雰囲気とかある？",
        "当日話しやすそうな話題、いまのうちに一つ見つけておきたいなと思って。",
      ],
    };
  }

  if (socialLead && fastTempo && noveltySeeking) {
    return {
      archetype: "空気を動かす先行型",
      summary: "会話の立ち上がりが速く、関係の最初の温度を作るのが得意なタイプです。出会ってすぐの数往復で、場を前に進める強さがあります。",
      strengths: [
        "初回メッセージで止まりにくい",
        "会話の停滞を自分から崩せる",
        "テンポよく相手の反応を引き出しやすい",
      ],
      cautions: [
        "早すぎると相手を置いていくことがある",
        "質問が続くと面接っぽく見えやすい",
      ],
      datingAdvice: "勢いは強みなので、そのあとに一度相手のペースを受け取る一言を入れるとかなり安定します。",
      recommendedScenarioId: "matching-app-first-chat",
      recommendedScenarioLabel: SCENARIO_LABELS["matching-app-first-chat"],
      suggestedOpeners: [
        "マッチありがとう。プロフィール見て、休日の過ごし方がちょっと気になった。",
        "最初に聞くの変かもだけど、最近ちょっと気分上がったことってあった？",
        "話しやすそうだなと思ってた。普段こういうアプリってどんな感じで使ってる？",
      ],
    };
  }

  if (quietRecovery && prefersCare) {
    return {
      archetype: "静かに距離を縮める観察型",
      summary: "深く聞くことや、相手の反応を見ながら距離を調整するのが上手なタイプです。派手さより、じわっと信頼を作る会話に向いています。",
      strengths: [
        "少人数や1対1で会話が深まりやすい",
        "相手の気持ちの変化を拾いやすい",
        "気まずい空気を強引にしないで戻せる",
      ],
      cautions: [
        "自分のことを出す量が足りないと、受け身に見えやすい",
        "遠慮しすぎると次の約束に進みにくい",
      ],
      datingAdvice: "聞き上手さは十分あるので、短くても自分の感想を混ぜると一気に会話が双方向になります。",
      recommendedScenarioId: "recovery-chat",
      recommendedScenarioLabel: SCENARIO_LABELS["recovery-chat"],
      suggestedOpeners: [
        "ちょっと間あいちゃったけど、ふと思い出して連絡してみた。",
        "この前の話、あとからじわっと気になってたんだよね。",
        "忙しい時期かなと思いつつ、軽く話せたらうれしいなと思って。",
      ],
    };
  }

  return {
    archetype: "自然体で関係を育てるバランス型",
    summary: "極端に寄りすぎず、相手や場面に合わせて調整できるタイプです。大きな穴が少ない分、目的に応じて練習テーマを絞ると伸びが速いです。",
    strengths: [
      "相手によって話し方を変えやすい",
      "初対面でも深掘りでも大崩れしにくい",
      "練習したことをそのまま実戦に移しやすい",
    ],
    cautions: [
      "器用さのぶん、印象が平均的になりやすい",
      "自分らしい一言を意識しないと記憶に残りにくい",
    ],
    datingAdvice: "バランス型は強いので、今日は何を伸ばす日かを決めて使うとアプリの価値が一気に上がります。",
    recommendedScenarioId: socialLead ? "after-first-date" : "professional-networking",
    recommendedScenarioLabel: socialLead
      ? SCENARIO_LABELS["after-first-date"]
      : SCENARIO_LABELS["professional-networking"],
    suggestedOpeners: [
      "会話しやすい相手だと、つい聞きたくなる話題ってある？",
      "最初は軽めに話したい派？それとも少し深い話もわりと好き？",
      "ちゃんと盛り上がる会話って、どんな空気だと作りやすいと思う？",
    ],
  };
}
