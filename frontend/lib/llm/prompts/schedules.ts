import type { BasePrompt } from "./business-plans"

/**
 * スケジュール分析プロンプト
 */
export function analyzeSchedulePrompt(schedule: {
  events: {
    title: string
    start: string
    end: string
    description?: string
    participants?: string[]
  }[]
  period: {
    start: string
    end: string
  }
}): BasePrompt {
  return {
    systemPrompt: `
あなたはスケジュール最適化アドバイザーとして、以下の観点で分析を行います：
1. スケジュールの効率性
2. 時間配分の適切性
3. 優先度の評価
4. 改善提案

分析は以下の形式で出力してください：
- スケジュール効率性評価（5段階）
- 最適な時間帯の活用状況
- 改善が必要な点（2-3点）
- 具体的な最適化提案（3点）
- 補足コメント
`,
    userPrompt: `
以下の期間のスケジュールを分析してください：

【期間】
${schedule.period.start} から ${schedule.period.end}

【イベント一覧】
${schedule.events
  .map(
    event => `
- ${event.title}
  開始: ${event.start}
  終了: ${event.end}
  ${event.description ? `内容: ${event.description}` : ""}
  ${
    event.participants
      ? `参加者: ${event.participants.join(", ")}`
      : ""
  }
`,
  )
  .join("\n")}
`,
    config: {
      temperature: 0.5,
      maxTokens: 1000,
    },
  }
}

/**
 * 自然言語からスケジュール生成プロンプト
 */
export function naturalLanguageToSchedulePrompt(input: string): BasePrompt {
  return {
    systemPrompt: `
あなたは自然言語をスケジュールデータに変換するアシスタントです。
以下の形式でJSONデータを生成してください：

{
  "title": "イベントタイトル",
  "start": "YYYY-MM-DDTHH:mm:ss",
  "end": "YYYY-MM-DDTHH:mm:ss",
  "description": "イベントの説明",
  "participants": ["参加者1", "参加者2"]
}

注意点：
- 日時が明示されていない場合は、適切なデフォルト値を設定
- 参加者が明示されていない場合は空配列
- 説明が不要な場合は空文字列
`,
    userPrompt: `
以下の内容からスケジュールデータを生成してください：

${input}
`,
    config: {
      temperature: 0.3,
      maxTokens: 500,
    },
  }
}

/**
 * スケジュール最適化提案プロンプト
 */
export function optimizeSchedulePrompt(
  currentSchedule: {
    events: {
      title: string
      start: string
      end: string
      priority: "high" | "medium" | "low"
    }[]
  },
  constraints: {
    workingHours?: {
      start: string
      end: string
    }
    preferredMeetingDuration?: number
    breakTime?: number
  },
): BasePrompt {
  return {
    systemPrompt: `
あなたはスケジュール最適化エキスパートとして、以下の観点で提案を行います：
1. 作業効率の最大化
2. 優先度に基づく時間配分
3. 適切な休憩時間の確保
4. ミーティングの最適化

提案は以下の形式で出力してください：
- 最適化されたスケジュール（JSON形式）
- 変更点の説明（主な変更3点）
- 期待される効果
- 注意点
`,
    userPrompt: `
以下のスケジュールと制約条件から、最適化案を提案してください：

【現在のスケジュール】
${currentSchedule.events
  .map(
    event => `
- ${event.title}
  開始: ${event.start}
  終了: ${event.end}
  優先度: ${event.priority}
`,
  )
  .join("\n")}

【制約条件】
- 作業時間: ${
  constraints.workingHours
    ? `${constraints.workingHours.start} - ${constraints.workingHours.end}`
    : "指定なし"
}
- 推奨ミーティング時間: ${
  constraints.preferredMeetingDuration
    ? `${constraints.preferredMeetingDuration}分`
    : "指定なし"
}
- 休憩時間: ${
  constraints.breakTime ? `${constraints.breakTime}分` : "指定なし"
}
`,
    config: {
      temperature: 0.7,
      maxTokens: 1500,
    },
  }
}
