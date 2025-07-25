interface VoiceModel {
  name: string;
  styles: VoiceStyle[];
}

interface VoiceStyle {
  id: number;
  name: string;
}

export const MESSAGE_LIST = [
  "1000文字コーディングしたよ、すごい！",
  "確実に進んでる、えらいよ～！",
  "コツコツ書いてるの尊敬する！",
  "もうそこまで書いたの！？すごすぎる！",
  "どんどん形になっていってるよ～！さすが！"
];

export const VOICE_MODELS: VoiceModel[] = [
  {
    name: "四国めたん",
    styles: [
      { id: 2, name: "ノーマル" },
      { id: 0, name: "あまあま" },
      { id: 4, name: "セクシー" },
      { id: 6, name: "ツンツン" },
      { id: 36, name: "ささやき" },
      { id: 37, name: "ヒソヒソ" },
    ],
  },
  {
    name: "ずんだもん",
    styles: [
      { id: 3, name: "ノーマル" },
      { id: 1, name: "あまあま" },
      { id: 5, name: "セクシー" },
      { id: 7, name: "ツンツン" },
      { id: 22, name: "ささやき" },
      { id: 38, name: "ヒソヒソ" },
      { id: 75, name: "ヘロヘロ" },
      { id: 76, name: "なみだめ" },
    ],
  },
  {
    name: "春日部つむぎ",
    styles: [{ id: 8, name: "ノーマル" }],
  },
  {
    name: "波音リツ",
    styles: [
      { id: 9, name: "ノーマル" },
      { id: 65, name: "クイーン" },
    ],
  },
  {
    name: "雨晴はう",
    styles: [{ id: 10, name: "ノーマル" }],
  },
  {
    name: "玄野武宏",
    styles: [
      { id: 11, name: "ノーマル" },
      { id: 39, name: "喜び" },
      { id: 40, name: "ツンギレ" },
      { id: 41, name: "悲しみ" },
    ],
  },
  {
    name: "白上虎太郎",
    styles: [
      { id: 12, name: "ふつう" },
      { id: 32, name: "わーい" },
      { id: 33, name: "びくびく" },
      { id: 34, name: "おこ" },
      { id: 35, name: "びえーん" },
    ],
  },
  {
    name: "青山龍星",
    styles: [
      { id: 13, name: "ノーマル" },
      { id: 81, name: "熱血" },
      { id: 82, name: "不機嫌" },
      { id: 83, name: "喜び" },
      { id: 84, name: "しっとり" },
      { id: 85, name: "かなしみ" },
      { id: 86, name: "囁き" },
    ],
  },
  {
    name: "冥鳴ひまり",
    styles: [{ id: 14, name: "ノーマル" }],
  },
  {
    name: "九州そら",
    styles: [
      { id: 16, name: "ノーマル" },
      { id: 15, name: "あまあま" },
      { id: 17, name: "セクシー" },
      { id: 18, name: "ツンツン" },
      { id: 19, name: "ささやき" },
    ],
  },
  {
    name: "もち子(cv 明日葉よもぎ)",
    styles: [
      { id: 20, name: "ノーマル" },
      { id: 66, name: "セクシー／あん子" },
      { id: 77, name: "泣き" },
      { id: 78, name: "怒り" },
      { id: 79, name: "喜び" },
      { id: 80, name: "のんびり" },
    ],
  },
  {
    name: "剣崎雌雄",
    styles: [{ id: 21, name: "ノーマル" }],
  },
  {
    name: "WhiteCUL",
    styles: [
      { id: 23, name: "ノーマル" },
      { id: 24, name: "たのしい" },
      { id: 25, name: "かなしい" },
      { id: 26, name: "びえーん" },
    ],
  },
  {
    name: "後鬼",
    styles: [
      { id: 27, name: "人間ver." },
      { id: 28, name: "ぬいぐるみver." },
      { id: 87, name: "人間（怒り）ver." },
      { id: 88, name: "鬼ver." },
    ],
  },
  {
    name: "No.7",
    styles: [
      { id: 29, name: "ノーマル" },
      { id: 30, name: "アナウンス" },
      { id: 31, name: "読み聞かせ" },
    ],
  },
  {
    name: "ちび式じい",
    styles: [{ id: 42, name: "ノーマル" }],
  },
  {
    name: "櫻歌ミコ",
    styles: [
      { id: 43, name: "ノーマル" },
      { id: 44, name: "第二形態" },
      { id: 45, name: "ロリ" },
    ],
  },
  {
    name: "小夜/SAYO",
    styles: [{ id: 46, name: "ノーマル" }],
  },
  {
    name: "ナースロボ＿タイプＴ",
    styles: [
      { id: 47, name: "ノーマル" },
      { id: 48, name: "楽々" },
      { id: 49, name: "恐怖" },
      { id: 50, name: "内緒話" },
    ],
  },
  {
    name: "†聖騎士 紅桜†",
    styles: [{ id: 51, name: "ノーマル" }],
  },
  {
    name: "雀松朱司",
    styles: [{ id: 52, name: "ノーマル" }],
  },
  {
    name: "麒ヶ島宗麟",
    styles: [{ id: 53, name: "ノーマル" }],
  },
  {
    name: "春歌ナナ",
    styles: [{ id: 54, name: "ノーマル" }],
  },
  {
    name: "猫使アル",
    styles: [
      { id: 55, name: "ノーマル" },
      { id: 56, name: "おちつき" },
      { id: 57, name: "うきうき" },
    ],
  },
  {
    name: "猫使ビィ",
    styles: [
      { id: 58, name: "ノーマル" },
      { id: 59, name: "おちつき" },
      { id: 60, name: "人見知り" },
    ],
  },
  {
    name: "中国うさぎ",
    styles: [
      { id: 61, name: "ノーマル" },
      { id: 62, name: "おどろき" },
      { id: 63, name: "こわがり" },
      { id: 64, name: "へろへろ" },
    ],
  },
  {
    name: "栗田まろん",
    styles: [{ id: 67, name: "ノーマル" }],
  },
  {
    name: "あいえるたん",
    styles: [{ id: 68, name: "ノーマル" }],
  },
  {
    name: "満別花丸",
    styles: [
      { id: 69, name: "ノーマル" },
      { id: 70, name: "元気" },
      { id: 71, name: "ささやき" },
      { id: 72, name: "ぶりっ子" },
      { id: 73, name: "ボーイ" },
    ],
  },
  {
    name: "琴詠ニア",
    styles: [{ id: 74, name: "ノーマル" }],
  },
];
