export const roleplayScenarios = [
  {
    id: "matching-app-first-chat",
    label: "マッチ後の初回チャット",
    description: "最初の数往復で安心感と興味を作る",
    objective: "自然に会話を続け、次の話題につなげる",
    context:
      "マッチングアプリでマッチした直後。まだ会ったことはなく、プロフィール情報だけ知っている状態。",
  },
  {
    id: "date-scheduling",
    label: "日程調整のやり取り",
    description: "断られにくく自然に予定を決める",
    objective: "押しすぎず、相手都合を尊重しながら日程を確定する",
    context:
      "数回やり取りをした後で、会う提案をする段階。相手の都合や温度感を見ながら進める。",
  },
  {
    id: "before-first-date",
    label: "初対面前日のやり取り",
    description: "緊張を下げて当日の会話を準備する",
    objective: "安心感を高め、当日の会話テーマを軽く作る",
    context:
      "初回デートの前日。会うことは決まっているが、お互いに少し緊張している。",
  },
] as const;

export const partnerStyles = [
  {
    id: "positive",
    label: "積極的タイプ",
    description: "返答は前向き。テンポ良く会話が進みやすい",
    promptHint:
      "相手は前向きで積極的。会話はテンポ良く進むが、雑にならず丁寧さは保ってください。",
  },
  {
    id: "cautious",
    label: "慎重タイプ",
    description: "警戒心がやや高く、信頼形成に時間が必要",
    promptHint:
      "相手は慎重で警戒心がある。急に距離を詰めると反応が弱くなるため、段階的に心を開いてください。",
  },
  {
    id: "busy",
    label: "返信ゆっくりタイプ",
    description: "短文が多く、反応が淡白に見える",
    promptHint:
      "相手は忙しく返信が短め。そっけなく見えても、無理に盛り上げようとせず自然に応答してください。",
  },
] as const;

export type RoleplayScenarioId = (typeof roleplayScenarios)[number]["id"];
export type PartnerStyleId = (typeof partnerStyles)[number]["id"];
