import { scheduleQueries } from "@/lib/db"
import { scheduleSchema } from "@/lib/validations/schedule"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const schedules = await scheduleQueries.findMany({
      where: {
        startDate: startDate ? { gte: new Date(startDate) } : undefined,
        endDate: endDate ? { lte: new Date(endDate) } : undefined,
      },
    })

    // バリデーション
    const validatedSchedules = schedules.map(schedule =>
      scheduleSchema.parse(schedule),
    )

    return NextResponse.json(validatedSchedules)
  }
  catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json(
      { error: "スケジュールの取得に失敗しました" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedSchedule = scheduleSchema.parse(body)

    const schedule = await scheduleQueries.create({
      data: validatedSchedule,
    })

    return NextResponse.json(schedule)
  }
  catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json(
      { error: "スケジュールの作成に失敗しました" },
      { status: 500 },
    )
  }
}
