import { Schedule, scheduleSchema } from "@/features/schedule/types"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * スケジュール一覧を取得
 */
export async function GET() {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // スケジュール一覧を取得
    const schedules = await db.schedule.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { participants: { some: { id: session.user.id } } },
        ],
      },
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ data: schedules })
  }
  catch (error) {
    console.error("スケジュール一覧取得エラー:", error)
    return NextResponse.json(
      { error: { message: "スケジュール一覧の取得に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}

/**
 * 新規スケジュールを作成
 */
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

    // バリデーション
    const validatedData = scheduleSchema.parse({
      ...body,
      createdBy: session.user.id,
    })

    // スケジュールを作成
    const schedule = await db.schedule.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    })

    return NextResponse.json({ data: schedule }, { status: 201 })
  }
  catch (error) {
    console.error("スケジュール作成エラー:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: { message: "入力データが不正です", code: "VALIDATION_ERROR", details: error.errors } },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: { message: "スケジュールの作成に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}
