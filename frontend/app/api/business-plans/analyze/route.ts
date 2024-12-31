import type { ActionItem, BusinessPlanInput, Risk } from "@/features/business-plan/types/BusinessPlan"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  // eslint-disable-next-line node/prefer-global/process
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // ユーザー認証の確認
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError)
      throw userError
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const { context } = await request.json()

    // 会話の文脈を1つの文字列にまとめる
    const contextSummary = context.join("\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `あなたは事業計画の分析と構造化を行うエキスパートAIです。
ユーザーとの会話の文脈から事業計画を分析し、以下の形式のJSONを生成してください。

日付は必ず"YYYY-MM-DD"形式で指定してください。
説明から具体的な日付が読み取れない場合は、以下のルールで設定してください：
- startDate: 現在の日付
- endDate: 説明から期間が読み取れる場合はその期間後の日付、読み取れない場合は1年後の日付

以下のJSON形式で出力してください：
{
  "title": "事業計画のタイトル",
  "description": "詳細な説明",
  "startDate": "YYYY-MM-DD形式の開始日（例：2024-01-01）",
  "endDate": "YYYY-MM-DD形式の終了日（例：2024-12-31）",
  "status": "draft",
  "context": {
    "what": "何を実施するか",
    "when": "いつまでに実施するか",
    "how": "どのように実施するか",
    "who": "誰が実施するか",
    "why": "なぜ実施するか"
  }
}`,
        },
        {
          role: "user",
          content: contextSummary,
        },
      ],
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("Failed to get response from OpenAI")
    }
    const analyzedPlan = JSON.parse(content) as BusinessPlanInput

    // 日付のバリデーション
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(analyzedPlan.startDate) || !dateRegex.test(analyzedPlan.endDate)) {
      // デフォルトの日付を設定
      const today = new Date()
      const oneYearLater = new Date()
      oneYearLater.setFullYear(today.getFullYear() + 1)

      analyzedPlan.startDate = today.toISOString().split("T")[0]
      analyzedPlan.endDate = oneYearLater.toISOString().split("T")[0]
    }

    // 事業計画を保存
    const { data: businessPlan, error: businessPlanError } = await supabase
      .from("business_plans")
      .insert({
        title: analyzedPlan.title,
        description: analyzedPlan.description,
        start_date: analyzedPlan.startDate,
        end_date: analyzedPlan.endDate,
        status: analyzedPlan.status,
        context: analyzedPlan.context,
        user_id: user.id,
      })
      .select()
      .single()

    if (businessPlanError) {
      console.error("Failed to create business plan:", businessPlanError)
      throw businessPlanError
    }

    // リソース分析
    const resourceAnalysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `事業計画に必要なリソースを分析し、アクションアイテムとして出力してください。
日付は必ず"YYYY-MM-DD"形式で指定してください。
開始日（${analyzedPlan.startDate}）から終了日（${analyzedPlan.endDate}）の間で適切な期限を設定してください。

以下のJSON形式で出力してください：
{
  "actionItems": [
    {
      "title": "アクションアイテムのタイトル",
      "description": "詳細な説明",
      "dueDate": "YYYY-MM-DD形式の期限",
      "status": "todo",
      "resources": ["必要なリソース1", "必要なリソース2"]
    }
  ]
}`,
        },
        {
          role: "user",
          content: JSON.stringify(analyzedPlan),
        },
      ],
    })

    const resourceContent = resourceAnalysis.choices[0].message.content
    if (!resourceContent) {
      throw new Error("Failed to get resource analysis from OpenAI")
    }
    const { actionItems } = JSON.parse(resourceContent) as { actionItems: ActionItem[] }

    // アクションアイテムを保存
    if (actionItems && actionItems.length > 0) {
      // 日付のバリデーション
      const validatedActionItems = actionItems.map((item: ActionItem) => {
        if (!dateRegex.test(item.dueDate)) {
          item.dueDate = analyzedPlan.endDate
        }
        return item
      })

      const { error: actionItemsError } = await supabase
        .from("action_items")
        .insert(
          validatedActionItems.map((item: ActionItem) => ({
            business_plan_id: businessPlan.id,
            title: item.title,
            description: item.description,
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

    // リスク分析
    const riskAnalysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `事業計画のリスクを分析し、以下のJSON形式で出力してください：

{
  "risks": [
    {
      "title": "リスクのタイトル",
      "description": "詳細な説明",
      "impact": "high/medium/low",
      "probability": "high/medium/low",
      "mitigation": "リスク対策"
    }
  ]
}`,
        },
        {
          role: "user",
          content: JSON.stringify(analyzedPlan),
        },
      ],
    })

    const riskContent = riskAnalysis.choices[0].message.content
    if (!riskContent) {
      throw new Error("Failed to get risk analysis from OpenAI")
    }
    const { risks } = JSON.parse(riskContent) as { risks: Risk[] }

    // リスクを保存
    if (risks && risks.length > 0) {
      const { error: risksError } = await supabase
        .from("risks")
        .insert(
          risks.map((risk: Risk) => ({
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

    // リスク分析の後に追加
    const milestoneAnalysis = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `事業計画の主要なマイルストーンを分析し、以下のJSON形式で出力してください。
開始日（${analyzedPlan.startDate}）から終了日（${analyzedPlan.endDate}）の間で、重要な達成ポイントを特定してください。

マイルストーンは以下の点を考慮して設定してください：
1. 事業計画の主要な節目
2. 重要な成果物の完成時期
3. 進捗確認のタイミング
4. 外部ステークホルダーとの重要な接点

{
  "milestones": [
    {
      "title": "マイルストーンのタイトル",
      "description": "詳細な説明",
      "dueDate": "YYYY-MM-DD形式の期限",
      "status": "pending"
    }
  ]
}`,
        },
        {
          role: "user",
          content: JSON.stringify({
            ...analyzedPlan,
            actionItems,
            risks,
          }),
        },
      ],
    })

    const milestoneContent = milestoneAnalysis.choices[0].message.content
    if (!milestoneContent) {
      throw new Error("Failed to get milestone analysis from OpenAI")
    }
    const { milestones } = JSON.parse(milestoneContent) as { milestones: Array<{
      title: string
      description: string
      dueDate: string
      status: "pending" | "completed"
    }> }

    // マイルストーンを保存
    if (milestones && milestones.length > 0) {
      // 日付のバリデーション
      const validatedMilestones = milestones.map((milestone) => {
        if (!dateRegex.test(milestone.dueDate)) {
          milestone.dueDate = analyzedPlan.endDate
        }
        return milestone
      })

      const { error: milestonesError } = await supabase
        .from("milestones")
        .insert(
          validatedMilestones.map(milestone => ({
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

    // 関連データを含む事業計画を返す（milestonesを追加）
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

    return NextResponse.json(fullBusinessPlan)
  }
  catch (error) {
    console.error("Error analyzing business plan:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { error: "Failed to analyze business plan" },
      { status: 500 },
    )
  }
}
