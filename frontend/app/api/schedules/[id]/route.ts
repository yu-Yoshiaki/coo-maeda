import { updateScheduleSchema } from "@/features/schedule/types"
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
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    const { data: schedule, error } = await db
      .from("schedules")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !schedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    if (schedule.created_by !== session.user.id && !schedule.participants?.includes(session.user.id)) {
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
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    const { data: existingSchedule, error: fetchError } = await db
      .from("schedules")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingSchedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    if (existingSchedule.created_by !== session.user.id) {
      return NextResponse.json(
        { error: { message: "アクセス権限がありません", code: "FORBIDDEN" } },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validatedData = updateScheduleSchema.parse(body)

    const { data: schedule, error: updateError } = await db
      .from("schedules")
      .update({
        ...validatedData,
        start_date: validatedData.startDate ? new Date(validatedData.startDate).toISOString() : null,
        end_date: validatedData.endDate ? new Date(validatedData.endDate).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ data: schedule })
  }
  catch (error) {
    console.error("スケジュール更新エラー:", error)
    if ((error as any).name === "ZodError") {
      return NextResponse.json(
        { error: { message: "入力データが不正です", code: "VALIDATION_ERROR", details: (error as any).errors } },
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
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    const { data: existingSchedule, error: fetchError } = await db
      .from("schedules")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingSchedule) {
      return NextResponse.json(
        { error: { message: "スケジュールが見つかりません", code: "NOT_FOUND" } },
        { status: 404 },
      )
    }

    if (existingSchedule.created_by !== session.user.id) {
      return NextResponse.json(
        { error: { message: "アクセス権限がありません", code: "FORBIDDEN" } },
        { status: 403 },
      )
    }

    const { error: deleteError } = await db
      .from("schedules")
      .delete()
      .eq("id", params.id)

    if (deleteError) {
      throw deleteError
    }

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
