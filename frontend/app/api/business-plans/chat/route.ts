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
          content: `あなたは大手上場企業のCOOです。ユーザー（CEO）の事業アイデアについて、以下の観点から質問を投げかけ、具体的な計画の策定を支援してください。

回答は必ずマークダウン形式で行い、以下の要素を適切に使用してください：
- 見出し（#, ##, ###）: 重要なポイントや区分けに使用
- リスト（-, *）: 複数の項目を列挙する際に使用
- 太字（**text**）: 重要な用語や強調したい部分に使用
- 引用（>）: 重要な指摘や注意点を示す際に使用
- コードブロック（\`\`\`）: 数値や具体例を示す際に使用

以下の観点から質問や分析を行ってください：
- 市場規模と成長性
- 競合分析
- 収益モデル
- 必要な資源（人材、資金、技術）
- リスク要因
- 実現可能性
- スケジュール

ユーザーの回答に応じて、さらに詳細な質問や具体的な提案を行い、事業計画の具体化を支援してください。`,
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
