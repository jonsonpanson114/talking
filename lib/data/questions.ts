import { Question } from "@/lib/types";

export const questions: Question[] = [
  // Casual / Icebreaker（初対面で話しやすい話題）
  {
    id: "casual-001",
    text: "最近、一番楽しかった週末はどんな週末でしたか？",
    category: "casual",
    tags: ["週末", "楽しい", "休日"],
    difficulty: "easy",
    type: "standard",
    tips: "いつ、どこで、誰と、何をしたかを具体的に話すと会話が広がります"
  },
  {
    id: "casual-002",
    text: "もし世界中どこにでも行けたら、今すぐ行きたい場所は？",
    category: "casual",
    tags: ["旅行", "夢", "場所"],
    difficulty: "easy",
    type: "standard",
    tips: "なぜそこに行きたいのか、理由を添えると話題が広がります"
  },
  {
    id: "casual-003",
    text: "趣味で一番時間を使っているのは何ですか？",
    category: "casual",
    tags: ["趣味", "興味", "時間"],
    difficulty: "easy",
    type: "standard",
    tips: "どうやって始めたのか、どんなところが楽しいかを話せると話題が広がります"
  },
  {
    id: "casual-004",
    text: "友達からどんなタイプの人って言われますか？",
    category: "casual",
    tags: ["性格", "友達", "タイプ"],
    difficulty: "medium",
    type: "standard",
    tips: "自分で思っている印象と、他の人からの印象のギャップを話すと面白いです"
  },
  {
    id: "casual-005",
    text: "休日は一人で過ごすことが多いですか、それとも誰かと？",
    category: "casual",
    tags: ["休日", "過ごし方", "一人"],
    difficulty: "easy",
    type: "standard",
    tips: "どちらであっても、どちらが好きかという点にフォーカスすると話題が広がります"
  },

  // Hobby（趣味・興味）
  {
    id: "hobby-001",
    text: "最近ハマっていることはありますか？",
    category: "hobby",
    tags: ["ハマり", "最近", "興味"],
    difficulty: "easy",
    type: "standard",
    tips: "どうやって知ったのか、どんなところが面白いのかを話せると話題が広がります"
  },
  {
    id: "hobby-002",
    text: "映画/音楽/ドラマで最近のおすすめはありますか？",
    category: "hobby",
    tags: ["映画", "音楽", "ドラマ"],
    difficulty: "easy",
    type: "standard",
    tips: "どんなジャンルが好きか、どんな気持ちの時に見るのかを話せると話題が広がります"
  },
  {
    id: "hobby-003",
    text: "カフェに行くならどんなカフェが好きですか？",
    category: "hobby",
    tags: ["カフェ", "場所", "好み"],
    difficulty: "easy",
    type: "standard",
    tips: "落ち着いた雰囲気か、賑やかな雰囲気かなど、どんなところが好きかを話せると話題が広がります"
  },
  {
    id: "hobby-004",
    text: "運動はしますか？するなら何を？",
    category: "hobby",
    tags: ["運動", "健康", "スポーツ"],
    difficulty: "easy",
    type: "standard",
    tips: "どのくらいの頻度でやるか、どんなところが好きかを話せると話題が広がります"
  },
  {
    id: "hobby-005",
    text: "本やポッドキャストなんか聞きますか？",
    category: "hobby",
    tags: ["本", "ポッドキャスト"],
    difficulty: "easy",
    type: "standard",
    tips: "どんなジャンルが好きか、いつ聞くのかを話せると話題が広がります"
  },

  // Food（食事・飲み物）
  {
    id: "food-001",
    text: "好きな食べ物と、絶対食べられないものは？",
    category: "food",
    tags: ["食べ物", "好き嫌い"],
    difficulty: "easy",
    type: "standard",
    tips: "なぜ好きなのか、なぜ食べられないのかというエピソードがあると面白いです"
  },
  {
    id: "food-002",
    text: "カレー系か、和食系か、どっち派ですか？",
    category: "food",
    tags: ["カレー", "和食", "好み"],
    difficulty: "easy",
    type: "standard",
    tips: "なぜその方が好きなのか、どんなシチュエーションで食べるのが好きかを話せると話題が広がります"
  },
  {
    id: "food-003",
    text: "お酒は飲みますか？飲むなら何が好き？",
    category: "food",
    tags: ["お酒", "飲み物"],
    difficulty: "easy",
    type: "standard",
    tips: "飲むときのシチュエーション、どんなお酒が好きかを話せると話題が広がります"
  },
  {
    id: "food-004",
    text: "初対面で行くならどんなお店がいいと思いますか？",
    category: "food",
    tags: ["お店", "初対面", "デート"],
    difficulty: "medium",
    type: "standard",
    tips: "どんな雰囲気が会話しやすいか、どんな料理が話題になりやすいかを話せると話題が広がります"
  },
  {
    id: "food-005",
    text: "自分で料理するのは得意？苦手？",
    category: "food",
    tags: ["料理", "得意", "苦手"],
    difficulty: "easy",
    type: "standard",
    tips: "得意なら何を作るのが得意か、苦手なら何が苦手かを話せると話題が広がります"
  },

  // Travel（旅行）
  {
    id: "travel-001",
    text: "旅行に行くなら海外と国内どっちが好き？",
    category: "travel",
    tags: ["旅行", "海外", "国内"],
    difficulty: "easy",
    type: "standard",
    tips: "なぜその方が好きなのか、どんなところが魅力かを話せると話題が広がります"
  },
  {
    id: "travel-002",
    text: "一番思い出に残っている旅行はどこでしたか？",
    category: "travel",
    tags: ["旅行", "思い出", "場所"],
    difficulty: "medium",
    type: "standard",
    tips: "いつ、誰と、どんなところが楽しかったかを話せると話題が広がります"
  },
  {
    id: "travel-003",
    text: "温泉派ですか、それとも海水浴派？",
    category: "travel",
    tags: ["温泉", "海水浴", "好み"],
    difficulty: "easy",
    type: "standard",
    tips: "なぜその方が好きなのか、どんなところがリラックスできるかを話せると話題が広がります"
  },
  {
    id: "travel-004",
    text: "一人旅はやったことありますか？",
    category: "travel",
    tags: ["一人旅", "経験"],
    difficulty: "medium",
    type: "standard",
    tips: "いつ、どこで、どんな一人旅だったかを話せると話題が広がります"
  },
  {
    id: "travel-005",
    text: "もし今すぐ休みが1週間取れたら、どう過ごす？",
    category: "travel",
    tags: ["休み", "過ごし方", "夢"],
    difficulty: "medium",
    type: "standard",
    tips: "なぜそこに行きたいのか、何をしたいのかを話せると話題が広がります"
  },

  // Weekend（週末の過ごし方）
  {
    id: "weekend-001",
    text: "来週末はどう過ごす予定ですか？",
    category: "weekend",
    tags: ["週末", "予定"],
    difficulty: "easy",
    type: "standard",
    tips: "予定があればどんな予定か、なければどんなことをしたいかを話せると話題が広がります"
  },
  {
    id: "weekend-002",
    text: "家でダラダラする派？それとも外に出る派？",
    category: "weekend",
    tags: ["週末", "過ごし方", "家"],
    difficulty: "easy",
    type: "standard",
    tips: "どちらが好きなのか、なぜそう過ごすのかを話せると話題が広がります"
  },
  {
    id: "weekend-003",
    text: "朝起きるのは得意ですか？苦手ですか？",
    category: "weekend",
    tags: ["朝", "起きる", "習慣"],
    difficulty: "easy",
    type: "standard",
    tips: "どっちであっても、朝イチからは何をしているかを話せると話題が広がります"
  },
  {
    id: "weekend-004",
    text: "雨の日はどう過ごすのが好き？",
    category: "weekend",
    tags: ["雨", "過ごし方"],
    difficulty: "easy",
    type: "standard",
    tips: "家で過ごすなら何をするか、外に出るならどこに行くかを話せると話題が広がります"
  },

  // This or That 二択質問
  {
    id: "this-or-that-001",
    text: "映画館で見る派 vs 家でストリーミング派",
    category: "icebreaker",
    tags: ["映画", "家", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "映画館で見る派",
    thatOption: "家でストリーミング派",
  },
  {
    id: "this-or-that-002",
    text: "朝食派 vs 夕食派",
    category: "icebreaker",
    tags: ["朝食", "夕食", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "朝食派",
    thatOption: "夕食派",
  },
  {
    id: "this-or-that-003",
    text: "計画を立てる派 vs その場の流れで行く派",
    category: "icebreaker",
    tags: ["計画", "その場", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "計画を立てる派",
    thatOption: "その場の流れで行く派",
  },
  {
    id: "this-or-that-004",
    text: "猫派 vs 犬派",
    category: "icebreaker",
    tags: ["猫", "犬", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "猫派",
    thatOption: "犬派",
  },
  {
    id: "this-or-that-005",
    text: "夏派 vs 冬派",
    category: "icebreaker",
    tags: ["夏", "冬", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "夏派",
    thatOption: "冬派",
  },
  {
    id: "this-or-that-006",
    text: "都会派 vs 田舎派",
    category: "icebreaker",
    tags: ["都会", "田舎", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "都会派",
    thatOption: "田舎派",
  },
  {
    id: "this-or-that-007",
    text: "話すのが好き vs 聞くのが好き",
    category: "icebreaker",
    tags: ["話す", "聞く", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "話すのが好き",
    thatOption: "聞くのが好き",
  },
  {
    id: "this-or-that-008",
    text: "コーヒー派 vs お茶派",
    category: "icebreaker",
    tags: ["コーヒー", "お茶", "好み"],
    difficulty: "easy",
    type: "this_or_that",
    thisOption: "コーヒー派",
    thatOption: "お茶派",
  },
];

// プリセット
export const presets = {
  "初対面で話しやすい10問": questions.filter(q =>
    ["casual", "icebreaker", "hobby"].includes(q.category)
  ).slice(0, 10),
  "食事デート用10問": questions.filter(q =>
    ["food"].includes(q.category)
  ).slice(0, 10),
  "週末の話題10問": questions.filter(q =>
    ["weekend", "casual"].includes(q.category)
  ).slice(0, 10),
  "二択クイズ8問（会話用）": questions.filter(q =>
    q.type === "this_or_that"
  ),
};

export const categories = [
  { id: "all", label: "すべて" },
  { id: "casual", label: "カジュアル" },
  { id: "hobby", label: "趣味" },
  { id: "food", label: "食事" },
  { id: "travel", label: "旅行" },
  { id: "weekend", label: "週末" },
  { id: "icebreaker", label: "アイスブレイカー" },
] as const;
