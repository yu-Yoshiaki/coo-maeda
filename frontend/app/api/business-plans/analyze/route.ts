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

    const { prompt } = await request.json()
    const openai = createOpenAIClient()
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 1,
      max_tokens: 1000,
    })

    return NextResponse.json({
      content: response.choices[0]?.message?.content || "",
    })
  }
  catch (error) {
    console.error("Error in business plan analysis:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 },
  )
}
