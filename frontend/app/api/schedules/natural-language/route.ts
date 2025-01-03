import { createOpenAIClient } from "@/lib/llm/config"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { text } = await request.json()
    const openai = createOpenAIClient()
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "自然言語の文章からスケジュール情報を抽出してください。日時、参加者、場所、目的などの情報を含めてください。",
        },
        { role: "user", content: text },
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
    console.error("Error in natural language processing:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  )
}
