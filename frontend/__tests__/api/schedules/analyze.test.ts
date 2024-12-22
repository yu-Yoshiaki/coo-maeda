import { POST } from "@/app/api/schedules/analyze/route"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMocks } from "node-mocks-http"
import OpenAI from "openai"

// モックの設定
jest.mock("@/lib/auth")
jest.mock("@/lib/db")
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

describe("schedule analyze API", () => {
  const mockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  }

  const mockSchedules = [
    {
      id: "1",
      title: "テストスケジュール1",
      start_date: "2024-01-01T09:00:00Z",
      end_date: "2024-01-01T10:00:00Z",
      created_by: "test-user-id",
    },
    {
      id: "2",
      title: "テストスケジュール2",
      start_date: "2024-01-02T09:00:00Z",
      end_date: "2024-01-02T10:00:00Z",
      created_by: "test-user-id",
    },
  ]

  const mockAnalysisResult = {
    summary: {
      totalEvents: 2,
      busyDays: ["2024-01-01", "2024-01-02"],
      quietDays: [],
      averageEventsPerDay: 1,
    },
    timeDistribution: {
      morningEvents: 2,
      afternoonEvents: 0,
      eveningEvents: 0,
      overlappingEvents: [],
    },
    patterns: {
      regularEvents: [
        {
          title: "テストスケジュール",
          frequency: "毎日",
          suggestedOptimization: "時間帯の分散を検討",
        },
      ],
      timePreferences: {
        preferredDays: ["月曜日", "火曜日"],
        preferredTimes: ["午前"],
      },
    },
    recommendations: {
      scheduling: ["午後の時間帯も活用することを検討"],
      optimization: ["類似の予定はまとめて実施"],
      workLifeBalance: ["休憩時間の確保を推奨"],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue(mockSession)
  })

  it("認証されていない場合は401を返す", async () => {
    ;(auth as jest.Mock).mockResolvedValueOnce(null)
    const { req } = createMocks({
      method: "POST",
      body: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe("UNAUTHORIZED")
  })

  it("スケジュールの分析を実行できる", async () => {
    // データベースのモック
    ;(db.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockSchedules,
              error: null,
            }),
          }),
        }),
      }),
    })

    // OpenAI APIのモック
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAnalysisResult),
          },
        },
      ],
    })

    const { req } = createMocks({
      method: "POST",
      body: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        includePatternAnalysis: true,
        includeTimeDistribution: true,
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockAnalysisResult)
  })

  it("バリデーションエラーの場合は400を返す", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        // startDateが欠けている
        endDate: "2024-01-31",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("VALIDATION_ERROR")
  })

  it("openAI APIがエラーを返した場合は500を返す", async () => {
    ;(db.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockSchedules,
              error: null,
            }),
          }),
        }),
      }),
    })

    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValueOnce(
      new Error("OpenAI API error"),
    )

    const { req } = createMocks({
      method: "POST",
      body: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR")
  })
})
