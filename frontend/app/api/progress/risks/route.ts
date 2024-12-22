import type { Risk } from "@/features/progress/types"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: risks, error } = await supabase
      .from("risks")
      .select("*")
      .order("severity", { ascending: false })

    if (error)
      throw error

    return NextResponse.json(risks)
  }
  catch (error) {
    console.error("[risks/GET]", error)
    return NextResponse.json(
      { error: "リスクの取得に失敗しました" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
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

    const { data: risk, error } = await supabase
      .from("risks")
      .insert([
        {
          title: json.title,
          description: json.description,
          severity: json.severity,
          impact: json.impact,
          mitigation: json.mitigation,
          related_tasks: json.relatedTasks || [],
        },
      ])
      .select()
      .single()

    if (error)
      throw error

    // 重要度が高い場合はアラートを作成
    if (json.severity === "HIGH" || json.severity === "CRITICAL") {
      const { error: alertError } = await supabase
        .from("alerts")
        .insert([
          {
            type: "RISK",
            message: `新しい${json.severity === "CRITICAL" ? "重大" : "高"}リスクが追加されました: ${json.title}`,
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
    console.error("[risks/POST]", error)
    return NextResponse.json(
      { error: "リスクの作成に失敗しました" },
      { status: 500 },
    )
  }
}
