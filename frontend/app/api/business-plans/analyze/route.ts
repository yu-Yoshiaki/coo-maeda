import { analyzePlanPrompt } from "@/lib/llm/prompts/business-plans"
import { LLMAnalyzer } from "@/lib/llm/services/analyzer"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { title, description, goals, risks } = body

    // 認証チェック
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    // LLMアナライザーの初期化
    const analyzer = new LLMAnalyzer()

    // プロンプトの作成と実行
    const prompt = analyzePlanPrompt({
      title,
      description,
      goals,
      risks,
    })
    const analysis = await analyzer.analyze(prompt)

    return NextResponse.json({ analysis })
  }
  catch (error) {
    console.error("Error in business plan analysis:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  )
}
