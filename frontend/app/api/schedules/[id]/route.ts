import { scheduleSchema, updateScheduleSchema } from "@/features/schedule/types"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * 特定のスケジュールを取得
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // スケジュールを取得
    const schedule = await db.schedule.findUnique({
      where: { id: params.id },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    // アクセス権限チェック
    if (schedule.createdBy !== session.user.id && !schedule.participants?.includes(session.user.id)) {
      return NextResponse.json(
        { error: { message: "アクセス権限がありません", code: "FORBIDDEN" } },
        { status: 403 },
      )
    }

    return NextResponse.json({ data: schedule })
  }
  catch (error) {
    console.error("スケジュール取得エラー:", error)
    return NextResponse.json(
      { error: { message: "スケジュールの取得に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}

/**
 * スケジュールを更新
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // 既存のスケジュールを取得
    const existingSchedule = await db.schedule.findUnique({
      where: { id: params.id },
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    // アクセス権限チェック
    if (existingSchedule.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: { message: "アクセス権限がありません", code: "FORBIDDEN" } },
        { status: 403 },
      )
    }

    // リクエストボディを取得
    const body = await request.json()

    // バリデーション
    const validatedData = updateScheduleSchema.parse(body)

    // スケジュールを更新
    const schedule = await db.schedule.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ data: schedule })
  }
  catch (error) {
    console.error("スケジュール更新エラー:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: { message: "入力データが不正です", code: "VALIDATION_ERROR", details: error.errors } },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: { message: "スケジュールの更新に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}

/**
 * スケジュールを削除
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // 既存のスケジュールを取得
    const existingSchedule = await db.schedule.findUnique({
      where: { id: params.id },
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    // アクセス権限チェック
    if (existingSchedule.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: { message: "アクセス権限がありません", code: "FORBIDDEN" } },
        { status: 403 },
      )
    }

    // スケジュールを削除
    await db.schedule.delete({
      where: { id: params.id },
    })

    return NextResponse.json(null, { status: 204 })
  }
  catch (error) {
    console.error("スケジュール削除エラー:", error)
    return NextResponse.json(
      { error: { message: "スケジュールの削除に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}
