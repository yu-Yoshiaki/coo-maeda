import type { Milestone, ProgressReport, Risk, Task } from "@/features/progress/types"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // タスク、マイルストーン、リスクを取得
    const [
      { data: tasks, error: tasksError },
      { data: milestones, error: milestonesError },
      { data: risks, error: risksError },
    ] = await Promise.all([
      supabase.from("tasks").select("*"),
      supabase.from("milestones").select("*"),
      supabase.from("risks").select("*"),
    ])

    if (tasksError)
      throw tasksError
    if (milestonesError)
      throw milestonesError
    if (risksError)
      throw risksError

    // 全体の進捗率を計算
    const overallProgress = tasks && tasks.length > 0
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
      : 0

    // 推奨事項を生成
    const recommendations: string[] = []

    // 遅延タスクのチェック
    const delayedTasks = tasks?.filter((task) => {
      const dueDate = new Date(task.due_date)
      return dueDate < new Date() && task.progress < 100
    })

    if (delayedTasks && delayedTasks.length > 0) {
      recommendations.push(
        `${delayedTasks.length}件のタスクが期限を過ぎています。優先的に対応が必要です。`,
      )
    }

    // ブロックされているタスクのチェック
    const blockedTasks = tasks?.filter(task => task.status === "BLOCKED")
    if (blockedTasks && blockedTasks.length > 0) {
      recommendations.push(
        `${blockedTasks.length}件のタスクがブロックされています。ブロック解除の対応が必要です。`,
      )
    }

    // 高リスク項目のチェック
    const highRisks = risks?.filter(
      risk => risk.severity === "HIGH" || risk.severity === "CRITICAL",
    )
    if (highRisks && highRisks.length > 0) {
      recommendations.push(
        `${highRisks.length}件の重要リスクが存在します。早急な対応が必要です。`,
      )
    }

    // 進捗の遅いマイルストーンのチェック
    const slowMilestones = milestones?.filter((milestone) => {
      const dueDate = new Date(milestone.due_date)
      const today = new Date()
      const totalDays = dueDate.getTime() - new Date(milestone.created_at).getTime()
      const elapsedDays = today.getTime() - new Date(milestone.created_at).getTime()
      const expectedProgress = (elapsedDays / totalDays) * 100
      return milestone.progress < expectedProgress - 20 // 期待進捗より20%以上遅れている場合
    })

    if (slowMilestones && slowMilestones.length > 0) {
      recommendations.push(
        `${slowMilestones.length}件のマイルストーンが予定より遅れています。スケジュールの見直しが必要です。`,
      )
    }

    const report: ProgressReport = {
      id: crypto.randomUUID(),
      title: `進捗レポート ${new Date().toLocaleDateString()}`,
      generatedAt: new Date(),
      overallProgress,
      milestones: milestones || [],
      tasks: tasks || [],
      risks: risks || [],
      recommendations,
    }

    // レポートをデータベースに保存
    const { error: saveError } = await supabase
      .from("progress_reports")
      .insert([report])

    if (saveError)
      throw saveError

    return NextResponse.json(report)
  }
  catch (error) {
    console.error("[reports/generate/POST]", error)
    return NextResponse.json(
      { error: "レポートの生成に失敗しました" },
      { status: 500 },
    )
  }
}
