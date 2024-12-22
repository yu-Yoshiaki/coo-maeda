import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: milestone, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error)
      throw error

    return NextResponse.json(milestone)
  }
  catch (error) {
    console.error("[milestones/[id]/GET]", error)
    return NextResponse.json(
      { error: "マイルストーンの取得に失敗しました" },
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

    // タスクの存在確認
    if (json.tasks && json.tasks.length > 0) {
      const { count, error: tasksError } = await supabase
        .from("tasks")
        .select("id", { count: "exact" })
        .in("id", json.tasks)

      if (tasksError)
        throw tasksError

      if (count !== json.tasks.length) {
        return NextResponse.json(
          { error: "指定されたタスクの一部が存在しません" },
          { status: 400 },
        )
      }
    }

    const { data: milestone, error } = await supabase
      .from("milestones")
      .update({
        title: json.title,
        due_date: json.dueDate,
        tasks: json.tasks,
        status: json.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error)
      throw error

    return NextResponse.json(milestone)
  }
  catch (error) {
    console.error("[milestones/[id]/PUT]", error)
    return NextResponse.json(
      { error: "マイルストーンの更新に失敗しました" },
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
      .from("milestones")
      .delete()
      .eq("id", params.id)

    if (error)
      throw error

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error("[milestones/[id]/DELETE]", error)
    return NextResponse.json(
      { error: "マイルストーンの削除に失敗しました" },
      { status: 500 },
    )
  }
}
