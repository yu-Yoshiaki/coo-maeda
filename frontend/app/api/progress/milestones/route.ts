import type { Milestone } from "@/features/progress/types"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: milestones, error } = await supabase
      .from("milestones")
      .select("*")
      .order("due_date", { ascending: true })

    if (error)
      throw error

    return NextResponse.json(milestones)
  }
  catch (error) {
    console.error("[milestones/GET]", error)
    return NextResponse.json(
      { error: "マイルストーンの取得に失敗しました" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
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
      .insert([
        {
          title: json.title,
          due_date: json.dueDate,
          tasks: json.tasks || [],
          progress: 0,
          status: "NOT_STARTED",
        },
      ])
      .select()
      .single()

    if (error)
      throw error

    return NextResponse.json(milestone)
  }
  catch (error) {
    console.error("[milestones/POST]", error)
    return NextResponse.json(
      { error: "マイルストーンの作成に失敗しました" },
      { status: 500 },
    )
  }
}
