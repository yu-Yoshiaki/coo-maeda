import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// リクエストボディのバリデーションスキーマ
const analyzeRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  includePatternAnalysis: z.boolean().default(true),
  includeTimeDistribution: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: { message: "認証が必要です", code: "UNAUTHORIZED" } },
        { status: 401 },
      )
    }

    // リクエストボディの取得とバリデーション
    const body = await request.json()
    const { startDate, endDate, includePatternAnalysis, includeTimeDistribution }
      = analyzeRequestSchema.parse(body)

    // 対象期間のスケジュールを取得
    const { data: schedules, error: schedulesError } = await db
      .from("schedules")
      .select("*")
      .gte("start_date", startDate)
      .lte("end_date", endDate)
      .eq("created_by", session.user.id)
      .order("start_date", { ascending: true })

    if (schedulesError)
      throw schedulesError

    // 分析用のプロンプトを生成
    const prompt = generateAnalysisPrompt(schedules, {
      startDate,
      endDate,
      includePatternAnalysis,
      includeTimeDistribution,
    })

    // OpenAI APIを使用して分析を実行
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const analysis = completion.choices[0]?.message?.content
    if (!analysis) {
      throw new Error("分析結果の生成に失敗しました")
    }

    // 分析結果をパースしてレスポンスを返す
    const result = JSON.parse(analysis)
    return NextResponse.json({ data: result })
  }
  catch (error) {
    console.error("スケジュール分析エラー:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: "入力データが不正です",
            code: "VALIDATION_ERROR",
            details: error.errors,
          },
        },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: { message: "スケジュールの分析に失敗しました", code: "INTERNAL_SERVER_ERROR" } },
      { status: 500 },
    )
  }
}

// 分析用のプロンプト生成
function generateAnalysisPrompt(
  schedules: any[],
  options: {
    startDate: string
    endDate: string
    includePatternAnalysis: boolean
    includeTimeDistribution: boolean
  },
): string {
  return `
あなたはスケジュール分析の専門家です。以下のスケジュールデータを分析し、洞察と提案を提供してください。

分析対象期間: ${options.startDate} から ${options.endDate}
スケジュール件数: ${schedules.length}件

スケジュールデータ:
${JSON.stringify(schedules, null, 2)}

以下の形式でJSONレスポンスを生成してください:

{
  "summary": {
    "totalEvents": number,
    "busyDays": string[],
    "quietDays": string[],
    "averageEventsPerDay": number
  },
  ${
    options.includeTimeDistribution
      ? `"timeDistribution": {
    "morningEvents": number,
    "afternoonEvents": number,
    "eveningEvents": number,
    "overlappingEvents": [
      {
        "date": string,
        "events": string[]
      }
    ]
  },`
      : ""
  }
  ${
    options.includePatternAnalysis
      ? `"patterns": {
    "regularEvents": [
      {
        "title": string,
        "frequency": string,
        "suggestedOptimization": string
      }
    ],
    "timePreferences": {
      "preferredDays": string[],
      "preferredTimes": string[]
    }
  },`
      : ""
  }
  "recommendations": {
    "scheduling": string[],
    "optimization": string[],
    "workLifeBalance": string[]
  }
}

分析の際は以下の点に注意してください：
1. 時間の重複や空き時間を効率的に活用する提案
2. パターンやトレンドの特定
3. ワークライフバランスの観点からの提案
4. 具体的で実行可能な改善提案
`
}
