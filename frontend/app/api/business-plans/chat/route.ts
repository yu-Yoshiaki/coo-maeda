// frontend/app/api/business-plans/chat/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  // eslint-disable-next-line node/prefer-global/process
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "あなたは事業計画の専門家です。ユーザーの事業アイデアについて、以下の観点から質問を投げかけ、具体的な計画の策定を支援してください：\n- 市場規模と成長性\n- 競合分析\n- 収益モデル\n- 必要な資源（人材、資金、技術）\n- リスク要因\n- 実現可能性\n- スケジュール",
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    })

    const assistantMessage = completion.choices[0].message.content

    return NextResponse.json({
      message: assistantMessage,
      context: assistantMessage,
    })
  }
  catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
