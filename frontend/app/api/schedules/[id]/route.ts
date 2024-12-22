import { scheduleQueries } from "@/lib/db"
import { scheduleSchema } from "@/lib/validations/schedule"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const schedule = await scheduleQueries.findUnique({
      where: { id: params.id },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: "スケジュールが見つかりません" },
        { status: 404 },
      )
    }

    // バリデーション
    const validatedSchedule = scheduleSchema.parse(schedule)

    return NextResponse.json(validatedSchedule)
  }
  catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json(
      { error: "スケジュールの取得に失敗しました" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()

    // バリデーション
    const validatedSchedule = scheduleSchema.parse(body)

    const schedule = await scheduleQueries.update({
      where: { id: params.id },
      data: validatedSchedule,
    })

    return NextResponse.json(schedule)
  }
  catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json(
      { error: "スケジュールの更新に失敗しました" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await scheduleQueries.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  }
  catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json(
      { error: "スケジュールの削除に失敗しました" },
      { status: 500 },
    )
  }
}
