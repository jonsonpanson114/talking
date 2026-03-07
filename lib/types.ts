export interface Question {
  id: string;
  text: string;
  category: "casual" | "hobby" | "food" | "travel" | "weekend" | "icebreaker";
  tags: string[];
  difficulty: "easy" | "medium";
  type: "standard" | "this_or_that";
  thisOption?: string;   // This or That用
  thatOption?: string;   // This or That用
  tips?: string;         // 返答のヒント
}

export interface ThisOrThatQuestion {
  id: string;
  text: string;
  thisOption: string;
  thatOption: string;
  axis: string;
  thisTendency: string;
  thatTendency: string;
}

export interface UserProgress {
  answeredQuestions: Record<string, string>;  // question_id -> user_answer
  favorites: string[];                         // お気に入り質問ID
  lastViewed: Record<string, Date>;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type RoleplayScenarioId =
  | "matching-app-first-chat"
  | "date-scheduling"
  | "before-first-date";

export type PartnerStyleId = "positive" | "cautious" | "busy";

export interface ConversationSettings {
  userName: string;          // ユーザーの名前（例：「太郎」）
  partnerName: string;       // 相手（AI）の名前（例：「花子」）
  persona: "casual" | "serious" | "humorous" | "cool";
  scenarioId: RoleplayScenarioId;
  partnerStyleId: PartnerStyleId;
}

export interface ConversationEvaluation {
  score: number;              // 総合スコア (0-100)
  twoWayScore: number;        // 双方向性スコア (0-100)
  balanceScore: number;       // バランススコア (0-100)
  connectionScore: number;    // 共通点スコア (0-100)
  naturalnessScore: number;   // 自然さスコア (0-100)
  curiosityScore: number;     // 質問の質と興味の示し方
  selfDisclosureScore: number; // 自己開示の適切さ
  empathyScore: number;       // 共感の伝え方
  paceScore: number;          // 押しすぎない進行
  nextStepScore: number;      // 次につなぐ力
  lengthFeedback: "too_short" | "too_long" | "good";
  feedback: string;           // 全体的なフィードバック
  improvements: string[];     // 改善点のリスト
  strengths: string[];        // 良かった点のリスト
  questionCount: number;      // ユーザーが返した質問の数
  totalTurns: number;         // 総ラリー数
  oneFocusImprovement: string; // 次回最優先の改善1つ
  nextMessageExample: string; // 次回使える自然な一言
  // 詳細フィードバック（追加分）
  goodMoments: ConversationHighlight[];  // 良かった瞬間（引用付き）
  improvementSuggestions: ImprovementSuggestion[];  // 具体的な改善提案
  nextGoals: string[];       // 次回の目標
  partnerTypeTips: string;   // 相手のタイプに合わせたヒント
}

export interface ConversationHighlight {
  turn: number;              // 何ターン目か
  quote: string;             // 会話の引用
  reason: string;           // なぜ良かったか
}

export interface ImprovementSuggestion {
  turn: number;              // 何ターン目か
  original: string;          // 元の発言
  better: string;            // こう言えばもっと良かった例
  reason: string;            // なぜ改善されるか
}

export type Category = Question["category"];
export type Persona = ConversationSettings["persona"];
