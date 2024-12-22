import type { Schedule } from "@/features/schedule/types"
import { openai } from "@/lib/openai"

export async function analyzeSchedule(text: string): Promise<Schedule> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは予定管理アシスタントです。ユーザーの入力から予定の情報を抽出し、JSON形式で返してください。",
        },
        {
          role: "user",
          content: text,
        },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("APIからの応答が不正です")
    }

    const schedule = JSON.parse(content)
    return schedule
  }
  catch (error) {
    console.error("予定の解析に失敗しました:", error)
    throw new Error("予定の解析に失敗しました")
  }
}
