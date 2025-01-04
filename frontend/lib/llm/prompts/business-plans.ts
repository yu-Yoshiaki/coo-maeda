import type { BasePrompt } from "../types"

/**
 * 事業計画生成プロンプト
 */
export function generateBusinessPlanPrompt(messages: { role: string, content: string }[]): BasePrompt {
  return {
    systemPrompt: `
あなたは事業計画の分析と構造化を行うエキスパートAIです。
ユーザーとの会話の文脈から事業計画を分析し、以下の形式のJSONを生成してください。

日付は必ず"YYYY-MM-DD"形式で指定してください。
説明から具体的な日付が読み取れない場合は、以下のルールで設定してください：
- startDate: 現在の日付
- endDate: 説明から期間が読み取れる場合はその期間後の日付、読み取れない場合は1年後の日付

以下のJSON形式で出力してください：
{
  "title": "事業計画のタイトル",
  "description": "詳細な説明",
  "startDate": "YYYY-MM-DD形式の開始日（例：2024-01-01）",
  "endDate": "YYYY-MM-DD形式の終了日（例：2024-12-31）",
  "status": "draft",
  "context": {
    "what": "何を実施するか",
    "when": "いつまでに実施するか",
    "how": "どのように実施するか",
    "who": "誰が実施するか",
    "why": "なぜ実施するか"
  },
  "actionItems": [
    {
      "title": "アクションアイテムのタイトル",
      "description": "詳細な説明",
      "startDate": "YYYY-MM-DD形式の開始日",
      "dueDate": "YYYY-MM-DD形式の期限",
      "status": "todo",
      "resources": ["必要なリソース1", "必要なリソース2"]
    }
  ],
  "risks": [
    {
      "title": "リスクのタイトル",
      "description": "詳細な説明",
      "impact": "high/medium/low",
      "probability": "high/medium/low",
      "mitigation": "リスク対策"
    }
  ],
  "milestones": [
    {
      "title": "マイルストーンのタイトル",
      "description": "詳細な説明",
      "dueDate": "YYYY-MM-DD形式の期限",
      "status": "pending"
    }
  ]
}`,
    userPrompt: messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n"),
    config: {
      temperature: 0.7,
      maxTokens: 2000,
    },
  }
}
