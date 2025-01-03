import { LLMChat } from "@/lib/llm/services/chat"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
// frontend/app/api/business-plans/chat/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { message, history } = body

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

    // チャットサービスの初期化
    const chat = new LLMChat(history)

    // システムプロンプト
    const systemPrompt = `
あなたは事業計画のアドバイザーとして、以下の観点でアドバイスを行います：
1. 事業計画の実現可能性
2. リスクと対策
3. 必要なリソース
4. スケジュール
5. KPIの設定

ユーザーの質問に対して、具体的で実践的なアドバイスを提供してください。
`

    // メッセージを送信
    const response = await chat.sendMessage(message, systemPrompt)

    return NextResponse.json({
      message: response,
      history: chat.getHistory(),
    })
  }
  catch (error) {
    console.error("Error in business plan chat:", error)
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
