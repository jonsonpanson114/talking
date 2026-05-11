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
  {
    id: "after-first-date",
    label: "初デート後の感想チャット",
    description: "デート終了後、次につなげるための重要な局面",
    objective: "お礼と感想を伝え、次の約束へのきっかけを作る",
    context: "初めてのデートが終わって帰宅した直後。感謝を伝えつつ、相手の好感度を確認したい状態。",
  },
  {
    id: "hobby-deep-dive",
    label: "共通の趣味についての深掘り",
    description: "特定の話題を掘り下げて盛り上げる練習",
    objective: "相手のこだわりを引き出し、自分の熱量も伝えつつ会話を広げる",
    context: "趣味の話で意気投合し始めた段階。より深いレベルで共感を得たい。",
  },
  {
    id: "recovery-chat",
    label: "少し気まずい沈黙の打破",
    description: "返信が数日空いた後のリカバリー",
    objective: "不自然にならずに会話を再開し、元の温度感に戻す",
    context: "忙しくて数日間返信を止めてしまった、あるいは相手からの返信が止まった後の最初のメッセージ。",
  },
  {
    id: "mutual-travel-planning",
    label: "初めての旅行の計画",
    description: "行きたい場所が分かれた時の建設的な相談",
    objective: "自分の意見を伝えつつ相手の希望も汲み取り、妥協点を見つけて盛り上げる",
    context: "仲良くなってきて初めての旅行を計画中。お互いのこだわりが少し違う場面で、すり合わせが必要な状態。",
  },
  {
    id: "professional-networking",
    label: "社会人同士の交流（仕事・趣味）",
    description: "仕事の話を重くならずに広げる練習",
    objective: "相手の専門性を尊重しつつ、共通の価値観や興味を見つけ出す",
    context: "同世代の社会人とマッチング。お互いの仕事の話から、人柄を深く知ろうとする段階。",
  },
  {
    id: "difficult-apology",
    label: "デリケートなお詫びとリスケ",
    description: "気まずい沈黙やミスを誠実にリセットする",
    objective: "誠実にお詫びしつつ、ネガティブな空気を変えて次につなげる",
    context: "急用でデートを直前キャンセルした、あるいは長期間返信を忘れていた際、関係を修復するためのやり取り。",
  },
] as const;

export const partnerStyles = [
  {
    id: "positive",
    label: "積極的タイプ",
    description: "返答は前向き。テンポ良く会話が進みやすい",
    promptHint:
      "あなたは相手に好意的で、自分から積極的に話題を提供したり、質問を重ねたりしてください。返信は早めで、明るくエネルギッシュな印象を与えてください。",
  },
  {
    id: "cautious",
    label: "慎重タイプ",
    description: "警戒心がやや高く、信頼形成に時間が必要",
    promptHint:
      "あなたは人見知りで少し慎重です。最初は短めの返答が多く、プライベートな質問には少し言葉を濁すかもしれません。相手が誠実さを示し、時間をかけて信頼を築くまでは、心を開きすぎないようにしてください。",
  },
  {
    id: "busy",
    label: "返信ゆっくりタイプ",
    description: "短文が多く、反応が淡白に見える",
    promptHint:
      "あなたは仕事やプライベートで多忙です。返信は一言二言の短文が基本で、余計な世間話はしません。冷たいわけではありませんが、要件のみを伝えるスタイルを貫いてください。絵文字も最小限です。",
  },
] as const;

export const partnerNames = [
  "ヒナ",
  "サオリ",
  "カナ",
  "ナナ",
  "リオ",
  "ミサキ",
  "アカリ",
  "ユイ",
  "サキ",
  "リン",
  "マユ",
  "エミ",
];

export type RoleplayScenarioId = (typeof roleplayScenarios)[number]["id"];
export type PartnerStyleId = (typeof partnerStyles)[number]["id"];

