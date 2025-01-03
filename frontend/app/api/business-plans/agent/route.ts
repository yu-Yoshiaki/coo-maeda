import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const { planId, message, context } = await request.json()

    // プランの所有者確認
    const { data: plan, error: planError } = await supabase
      .from("business_plans")
      .select()
      .eq("id", planId)
      .eq("user_id", user.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Business plan not found" },
        { status: 404 },
      )
    }

    // AIエージェントのシステムプロンプトを構築
    const systemPrompt = `あなたは事業計画「${context.title}」の専属AIアシスタントです。
以下のコンテキストを基に、プロジェクトの進行をサポートしてください：

【事業計画の概要】
- タイトル: ${context.title}
- 説明: ${context.description}
- ステータス: ${context.status}

【5W1H】
- What（何を）: ${context.context.what}
- When（いつ）: ${context.context.when}
- Where（どこで）: ${context.context.where}
- Who（誰が）: ${context.context.who}
- Why（なぜ）: ${context.context.why}
- How（どのように）: ${context.context.how}

【アクションアイテム】
${context.actionItems?.map((item: any) => `- ${item.title} (${item.status})`).join("\n")}

【マイルストーン】
${context.milestones?.map((milestone: any) => `- ${milestone.title} (${milestone.status})`).join("\n")}

あなたの役割：
1. プロジェクトの進捗状況を把握し、適切なアドバイスを提供
2. リスクの早期発見と対策の提案
3. チーム間のコミュニケーション促進
4. ベストプラクティスの提案
5. 期限やマイルストーンの管理支援

ユーザーからの質問に対して、このコンテキストを考慮しながら、具体的で実用的なアドバイスを提供してください。`

    // OpenAIのAPIを呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      response: completion.choices[0].message.content,
    })
  }
  catch (error) {
    console.error("Error in agent API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
