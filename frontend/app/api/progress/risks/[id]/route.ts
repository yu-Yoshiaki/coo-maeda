import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: risk, error } = await supabase
      .from("risks")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error)
      throw error

    return NextResponse.json(risk)
  }
  catch (error) {
    console.error("[risks/[id]/GET]", error)
    return NextResponse.json(
      { error: "リスクの取得に失敗しました" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const json = await request.json()

    // 関連タスクの存在確認
    if (json.relatedTasks && json.relatedTasks.length > 0) {
      const { count, error: tasksError } = await supabase
        .from("tasks")
        .select("id", { count: "exact" })
        .in("id", json.relatedTasks)

      if (tasksError)
        throw tasksError

      if (count !== json.relatedTasks.length) {
        return NextResponse.json(
          { error: "指定されたタスクの一部が存在しません" },
          { status: 400 },
        )
      }
    }

    // 現在のリスクを取得
    const { data: currentRisk, error: getCurrentError } = await supabase
      .from("risks")
      .select("severity")
      .eq("id", params.id)
      .single()

    if (getCurrentError)
      throw getCurrentError

    const { data: risk, error } = await supabase
      .from("risks")
      .update({
        title: json.title,
        description: json.description,
        severity: json.severity,
        impact: json.impact,
        mitigation: json.mitigation,
        related_tasks: json.relatedTasks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error)
      throw error

    // 重要度が上がった場合はアラートを作成
    if (
      (currentRisk.severity !== "HIGH" && currentRisk.severity !== "CRITICAL")
      && (json.severity === "HIGH" || json.severity === "CRITICAL")
    ) {
      const { error: alertError } = await supabase
        .from("alerts")
        .insert([
          {
            type: "RISK",
            message: `リスクの重要度が${json.severity === "CRITICAL" ? "重大" : "高"}に上昇しました: ${json.title}`,
            created_at: new Date().toISOString(),
            is_read: false,
          },
        ])

      if (alertError)
        throw alertError
    }

    return NextResponse.json(risk)
  }
  catch (error) {
    console.error("[risks/[id]/PUT]", error)
    return NextResponse.json(
      { error: "リスクの更新に失敗しました" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase
      .from("risks")
      .delete()
      .eq("id", params.id)

    if (error)
      throw error

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error("[risks/[id]/DELETE]", error)
    return NextResponse.json(
      { error: "リスクの削除に失敗しました" },
      { status: 500 },
    )
  }
}
