import { POST } from "@/app/api/schedules/natural-language/route"
import { NextRequest } from "next/server"

// モックスケジュール
const mockSchedule = {
  title: "ミーティング",
  startDate: "2024-01-01T14:00:00",
  endDate: "2024-01-01T15:00:00",
  location: "会議室A",
  isAllDay: false,
}

// OpenAIのモック
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}

jest.mock("@/lib/openai", () => ({
  openai: mockOpenAI,
}))

describe("natural-language API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockSchedule),
          },
        },
      ],
    })
  })

  it("pOSTリクエストで自然言語を解析できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules/natural-language", {
      method: "POST",
      body: JSON.stringify({ text: "明日の14時から1時間、会議室Aでミーティング" }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ data: mockSchedule })
  })

  it("エラー時に適切なレスポンスを返す", async () => {
    mockOpenAI.chat.completions.create.mockRejectedValueOnce(
      new Error("API Error"),
    )

    const request = new NextRequest("http://localhost:3000/api/schedules/natural-language", {
      method: "POST",
      body: JSON.stringify({ text: "invalid input" }),
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: "予定の解析に失敗しました",
    })
  })
})
