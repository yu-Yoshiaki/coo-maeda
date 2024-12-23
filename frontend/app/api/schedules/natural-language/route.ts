/* eslint-disable node/prefer-global/process */
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const analyzeRequestSchema = z.object({
  text: z.string().min(1).max(1000),
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { text } = analyzeRequestSchema.parse(body)

    // OpenAIを使用して予定を分析
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
あなたは予定テキストを解析し、以下の形式でJSONを生成するアシスタントです：
{
  "title": "予定のタイトル",
  "description": "予定の詳細な説明",
  "startDate": "開始日時（ISO 8601形式）",
  "endDate": "終了日時（ISO 8601形式）",
  "isAllDay": "終日予定かどうか（true/false）",
  "location": "場所（指定がある場合）",
  "participants": ["参加者1", "参加者2"]（指定がある場合）
}

日時が明示的に指定されていない場合：
- 「明日」は次の日の9:00を開始時刻とする
- 「来週」は次の週の月曜9:00を開始時刻とする
- 時間の指定がない場合は、1時間の予定とする
- 「午前」は9:00、「午後」は13:00、「夜」は19:00を開始時刻とする

結果は必ずJSON形式で返してください。
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error("予定の分析に失敗しました")
    }

    // JSONをパースして返す
    const parsedResult = JSON.parse(result)
    return NextResponse.json({ data: parsedResult })
  }
  catch (error) {
    console.error("予定分析エラー:", error)
    if ((error as any).name === "ZodError") {
      return NextResponse.json(
        { error: { message: "入力データが不正です", code: "VALIDATION_ERROR", details: (error as any).errors } },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: { message: "予定の分析に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}
