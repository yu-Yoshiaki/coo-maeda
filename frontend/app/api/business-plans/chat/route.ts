import { createOpenAIClient } from "@/lib/llm/config"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `私はCOOとしてあなたの事業計画をサポートします。以下の観点から分析と提案を行います：

1. 実行可能性の評価
   - リソースの適切な配分
   - タイムラインの現実性
   - 必要なケイパビリティの評価

2. リスク分析
   - 潜在的な課題の特定
   - 対応策の提案
   - コンティンジェンシープランの検討

3. 改善提案
   - 具体的なアクションアイテム
   - KPIの設定と測定方法
   - マイルストーンの設定

4. 組織的な観点
   - チーム構成の適切性
   - 必要なスキルセット
   - コミュニケーション計画

あなたの計画に対して、実践的かつ建設的なフィードバックを提供します。
必要に応じて、より詳細な情報を質問させていただくことがあります。`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { messages } = await request.json()
    const openai = createOpenAIClient()
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      model: "gpt-4o-mini",
      temperature: 1,
      max_tokens: 1000,
    })

    return NextResponse.json({
      content: response.choices[0]?.message?.content || "",
    })
  }
  catch (error) {
    console.error("Error in business plan chat:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  )
}
