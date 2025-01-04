import type { ActionItem, BusinessPlanInput, BusinessPlanResponse, Milestone, Risk } from "@/features/business-plan/types/BusinessPlan"
import { generateBusinessPlanPrompt } from "@/lib/llm/prompts/business-plans"
import { analyzeJSON } from "@/lib/llm/services/analyzer"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { messages } = body

    // 認証チェック
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<BusinessPlanResponse>({
        error: "Unauthorized",
        status: "error",
        message: "認証が必要です",
      }, { status: 401 })
    }

    // LLMアナライザーの初期化とプロンプト実行
    const prompt = generateBusinessPlanPrompt(messages)
    const plan = await analyzeJSON<BusinessPlanInput>(prompt)

    // 事業計画を保存
    const { data: businessPlan, error: businessPlanError } = await supabase
      .from("business_plans")
      .insert({
        title: plan.title,
        description: plan.description,
        start_date: plan.startDate,
        end_date: plan.endDate,
        status: plan.status,
        context: plan.context,
        user_id: user.id,
      })
      .select()
      .single()

    if (businessPlanError) {
      console.error("Failed to create business plan:", businessPlanError)
      throw businessPlanError
    }

    // アクションアイテムを保存
    if (plan.actionItems && plan.actionItems.length > 0) {
      const { error: actionItemsError } = await supabase
        .from("action_items")
        .insert(
          plan.actionItems.map((item: ActionItem) => ({
            business_plan_id: businessPlan.id,
            title: item.title,
            description: item.description,
            start_date: item.startDate,
            due_date: item.dueDate,
            status: item.status,
            resources: item.resources,
          })),
        )

      if (actionItemsError) {
        console.error("Failed to create action items:", actionItemsError)
        throw actionItemsError
      }
    }

    // リスクを保存
    if (plan.risks && plan.risks.length > 0) {
      const { error: risksError } = await supabase
        .from("risks")
        .insert(
          plan.risks.map((risk: Risk) => ({
            business_plan_id: businessPlan.id,
            title: risk.title,
            description: risk.description,
            impact: risk.impact,
            probability: risk.probability,
            mitigation: risk.mitigation,
          })),
        )

      if (risksError) {
        console.error("Failed to create risks:", risksError)
        throw risksError
      }
    }

    // マイルストーンを保存
    if (plan.milestones && plan.milestones.length > 0) {
      const { error: milestonesError } = await supabase
        .from("milestones")
        .insert(
          plan.milestones.map((milestone: Milestone) => ({
            business_plan_id: businessPlan.id,
            title: milestone.title,
            description: milestone.description,
            due_date: milestone.dueDate,
            status: milestone.status,
          })),
        )

      if (milestonesError) {
        console.error("Failed to create milestones:", milestonesError)
        throw milestonesError
      }
    }

    // 関連データを含む事業計画を返す
    const { data: fullBusinessPlan, error: fetchError } = await supabase
      .from("business_plans")
      .select(`
        *,
        action_items (*),
        risks (*),
        milestones (*)
      `)
      .eq("id", businessPlan.id)
      .single()

    if (fetchError) {
      console.error("Failed to fetch business plan:", fetchError)
      throw fetchError
    }

    return NextResponse.json<BusinessPlanResponse>({
      data: fullBusinessPlan,
      status: "success",
      message: "事業計画を作成しました",
    })
  }
  catch (error) {
    return NextResponse.json<BusinessPlanResponse>({
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
      message: "事業計画の生成中にエラーが発生しました",
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  )
}
