import { scheduleAnalyzer } from "@/features/schedule/llm/scheduleAnalyzer"
import { scheduleSchema } from "@/lib/validations/schedule"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: "テキストが必要です" },
        { status: 400 },
      )
    }

    const schedule = await scheduleAnalyzer.analyze({
      text,
      contextDate: new Date(),
    })

    // バリデーション
    const validatedSchedule = scheduleSchema.parse(schedule)

    return NextResponse.json(validatedSchedule)
  }
  catch (error) {
    console.error("Error in natural language processing:", error)
    return NextResponse.json(
      { error: "スケジュールの解析に失敗しました" },
      { status: 500 },
    )
  }
}
