import { scheduleAnalyzer } from "@/features/schedule/llm/scheduleAnalyzer"
import { openai } from "@/lib/openai"

// OpenAI APIのモック
jest.mock("@/lib/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}))

describe("scheduleAnalyzer", () => {
  const mockDate = new Date("2023-12-22T00:00:00Z")

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("analyze", () => {
    it("自然言語からスケジュール情報を抽出できる", async () => {
      // モックの設定
      const mockDateTimeResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                startDate: "2023-12-23T14:00:00+09:00",
                endDate: "2023-12-23T15:00:00+09:00",
                isAllDay: false,
              }),
            },
          },
        ],
      }

      const mockScheduleResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "ミーティング",
                location: "会議室A",
                participants: [
                  {
                    name: "山田太郎",
                    email: "yamada@example.com",
                    role: "organizer",
                  },
                ],
              }),
            },
          },
        ],
      }

      ;(openai.chat.completions.create as jest.Mock)
        .mockResolvedValueOnce(mockDateTimeResponse)
        .mockResolvedValueOnce(mockScheduleResponse)

      // テストの実行
      const result = await scheduleAnalyzer.analyze({
        text: "明日の14時から1時間、会議室Aでミーティング",
        contextDate: mockDate,
      })

      // 検証
      expect(result).toEqual({
        title: "ミーティング",
        startDate: new Date("2023-12-23T14:00:00+09:00"),
        endDate: new Date("2023-12-23T15:00:00+09:00"),
        isAllDay: false,
        location: "会議室A",
        participants: [
          {
            name: "山田太郎",
            email: "yamada@example.com",
            role: "organizer",
          },
        ],
      })

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2)
    })

    it("終日予定を解析できる", async () => {
      // モックの設定
      const mockDateTimeResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                startDate: "2023-12-23T00:00:00+09:00",
                endDate: "2023-12-23T23:59:59+09:00",
                isAllDay: true,
              }),
            },
          },
        ],
      }

      const mockScheduleResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "休暇",
                description: "年次有給休暇",
              }),
            },
          },
        ],
      }

      ;(openai.chat.completions.create as jest.Mock)
        .mockResolvedValueOnce(mockDateTimeResponse)
        .mockResolvedValueOnce(mockScheduleResponse)

      // テストの実行
      const result = await scheduleAnalyzer.analyze({
        text: "明日は休暇を取ります",
        contextDate: mockDate,
      })

      // 検証
      expect(result).toEqual({
        title: "休暇",
        description: "年次有給休暇",
        startDate: new Date("2023-12-23T00:00:00+09:00"),
        endDate: new Date("2023-12-23T23:59:59+09:00"),
        isAllDay: true,
      })
    })

    it("繰り返し予定を解析できる", async () => {
      // モックの設定
      const mockDateTimeResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                startDate: "2023-12-23T10:00:00+09:00",
                endDate: "2023-12-23T11:00:00+09:00",
                isAllDay: false,
              }),
            },
          },
        ],
      }

      const mockScheduleResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "朝会",
                location: "オンライン",
                recurrence: {
                  frequency: "weekly",
                  interval: 1,
                  daysOfWeek: [1], // 月曜日
                },
              }),
            },
          },
        ],
      }

      ;(openai.chat.completions.create as jest.Mock)
        .mockResolvedValueOnce(mockDateTimeResponse)
        .mockResolvedValueOnce(mockScheduleResponse)

      // テストの実行
      const result = await scheduleAnalyzer.analyze({
        text: "毎週月曜日の10時から1時間、オンラインで朝会",
        contextDate: mockDate,
      })

      // 検証
      expect(result).toEqual({
        title: "朝会",
        location: "オンライン",
        startDate: new Date("2023-12-23T10:00:00+09:00"),
        endDate: new Date("2023-12-23T11:00:00+09:00"),
        isAllDay: false,
        recurrence: {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [1],
        },
      })
    })

    it("エラー時に適切に例外を投げる", async () => {
      // モックの設定
      ;(openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      )

      // テストの実行と検証
      await expect(
        scheduleAnalyzer.analyze({
          text: "明日の会議",
          contextDate: mockDate,
        }),
      ).rejects.toThrow("API Error")
    })
  })
})
