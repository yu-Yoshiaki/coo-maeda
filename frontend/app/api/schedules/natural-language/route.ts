import type { NaturalLanguageScheduleInput } from "@/features/schedule/types"
import { scheduleAnalyzer } from "@/features/schedule/llm/scheduleAnalyzer"
import { db } from "@/lib/db"
import { openai } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { text, userId, contextDate } = json as NaturalLanguageScheduleInput

    // OpenAI APIを使用してスケジュール情報を抽出
    const scheduleInfo = await scheduleAnalyzer.analyze({
      text,
      contextDate,
    })

    // 抽出した情報を使用してスケジュールを作成
    const schedule = await db.schedule.create({
      data: {
        title: scheduleInfo.title,
        description: scheduleInfo.description,
        startDate: scheduleInfo.startDate,
        endDate: scheduleInfo.endDate,
        isAllDay: scheduleInfo.isAllDay,
        location: scheduleInfo.location,
        status: "scheduled",
        createdBy: userId,
        participants: {
          create: scheduleInfo.participants,
        },
        reminders: {
          create: scheduleInfo.reminders,
        },
        recurrence: scheduleInfo.recurrence
          ? {
              create: scheduleInfo.recurrence,
            }
          : undefined,
      },
      include: {
        participants: true,
        reminders: true,
        recurrence: true,
      },
    })

    return NextResponse.json(schedule)
  }
  catch (error) {
    console.error("[SCHEDULE_NATURAL_LANGUAGE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
