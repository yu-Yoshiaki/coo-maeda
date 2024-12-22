import type { PromptConfig } from "../types"

export const scheduleAnalysisPrompt: PromptConfig = {
  systemPrompt: `
あなたは自然言語からスケジュール情報を抽出するアシスタントです。
以下の形式でJSONを出力してください：

{
  "title": "スケジュールのタイトル",
  "startDate": "開始日時",
  "endDate": "終了日時",
  "location": "場所（オプション）",
  "description": "説明（オプション）",
  "isAllDay": "終日イベントかどうか（true/false）"
}

日時の解釈について：
- 「今日」「明日」「明後日」は現在日付から計算
- 時刻が指定されない場合は終日イベントとして扱う
- 期間が指定されない場合はデフォルトで1時間
- 相対時間（例：「1時間後」）は現在時刻から計算

入力例：
「明日の14時から1時間、会議室Aでミーティング」

出力例：
{
  "title": "ミーティング",
  "startDate": "明日 14:00",
  "endDate": "明日 15:00",
  "location": "会議室A",
  "isAllDay": false
}
`,
  userPrompt: "以下のテキストからスケジュール情報を抽出してください：",
  temperature: 0.3,
  maxTokens: 500,
}

export const scheduleProposalPrompt: PromptConfig = {
  systemPrompt: `
あなたは既存のスケジュールを考慮して、新しいスケジュールの提案を行うアシスタントです。
以下の点を考慮して提案を行ってください：

1. 既存のスケジュールとの重複を避ける
2. 移動時間を考慮する
3. 参加者の都合を考慮する
4. 業務時間内（9:00-18:00）を優先する
5. ランチタイム（12:00-13:00）を避ける

提案は以下の形式でJSONで出力してください：

{
  "proposals": [
    {
      "startDate": "提案する開始日時",
      "endDate": "提案する終了日時",
      "reason": "この時間帯を提案する理由"
    }
  ]
}
`,
  userPrompt: "以下の条件で適切な時間帯を提案してください：",
  temperature: 0.7,
  maxTokens: 1000,
}
