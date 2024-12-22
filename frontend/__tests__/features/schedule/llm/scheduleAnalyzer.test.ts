import { analyzeSchedule } from "@/features/schedule/llm/scheduleAnalyzer"
import { mockOpenAI } from "@/lib/openai"

jest.mock("@/lib/openai", () => ({
  mockOpenAI: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}))

describe("scheduleAnalyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("基本的な予定情報を抽出できる", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "ミーティング",
              startDate: "2024-01-01T14:00:00",
              endDate: "2024-01-01T15:00:00",
              location: "会議室A",
              isAllDay: false,
            }),
          },
        },
      ],
    }

    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce(mockResponse)

    const result = await analyzeSchedule("明日の14時から1時間、会議室Aでミーティング")

    expect(result).toEqual({
      title: "ミーティング",
      startDate: "2024-01-01T14:00:00",
      endDate: "2024-01-01T15:00:00",
      location: "会議室A",
      isAllDay: false,
    })
  })

  it("終日の予定を解析できる", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "休暇",
              startDate: "2024-01-01T00:00:00",
              endDate: "2024-01-01T23:59:59",
              location: "",
              isAllDay: true,
            }),
          },
        },
      ],
    }

    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce(mockResponse)

    const result = await analyzeSchedule("明日は休暇")

    expect(result).toEqual({
      title: "休暇",
      startDate: "2024-01-01T00:00:00",
      endDate: "2024-01-01T23:59:59",
      location: "",
      isAllDay: true,
    })
  })

  it("エラーハンドリングができる", async () => {
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

    await expect(analyzeSchedule("invalid input")).rejects.toThrow("予定の解析に失敗しました")
  })
})
