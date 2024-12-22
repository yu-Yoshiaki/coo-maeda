import { analyzeDateTimeExpression, analyzeSchedule, proposeSchedule } from "@/features/schedule/llm/scheduleAnalyzer"
import { openai } from "@/lib/openai"

// OpenAIのモックを設定
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
  const mockValidResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: "ミーティング",
            startDate: "2024-01-01 14:00",
            endDate: "2024-01-01 15:00",
            location: "会議室A",
            isAllDay: false,
          }),
        },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(openai.chat.completions.create as jest.Mock).mockResolvedValue(mockValidResponse)
  })

  describe("analyzeSchedule", () => {
    it("正常なレスポンスを処理できる", async () => {
      const result = await analyzeSchedule("明日の14時から1時間、会議室Aでミーティング")
      expect(result).toEqual({
        title: "ミーテ���ング",
        startDate: expect.any(String), // ISOString形式の日時
        endDate: expect.any(String), // ISOString形式の日時
        location: "会議室A",
        isAllDay: false,
      })
      // 日時形式の検証
      expect(new Date(result.startDate).toISOString()).toBe(result.startDate)
      expect(new Date(result.endDate).toISOString()).toBe(result.endDate)
    })

    it("空の入力でエラーを返す", async () => {
      await expect(analyzeSchedule("")).rejects.toThrow("テキストを入力してください")
    })

    it("長すぎる入力でエラーを返す", async () => {
      const longText = "a".repeat(1001)
      await expect(analyzeSchedule(longText)).rejects.toThrow(
        "テキストは1000文字以内である必要があります",
      )
    })

    it("aPIエラー時に適切なエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      )
      await expect(analyzeSchedule("テスト")).rejects.toThrow(
        "予定の解析に失敗しました",
      )
    })

    it("不正なJSONレスポンスでエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: "invalid json" } }],
      })
      await expect(analyzeSchedule("テスト")).rejects.toThrow(
        "スケジュール情報のパースに失敗しました",
      )
    })

    it("必須フィールドが欠けているレスポンスでエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "ミーティング",
                // startDateとendDateが欠けている
                isAllDay: false,
              }),
            },
          },
        ],
      })
      await expect(analyzeSchedule("テスト")).rejects.toThrow(
        "必須フィールドが不足しています",
      )
    })

    it("不正な日時形式でエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "ミーティング",
                startDate: "invalid date",
                endDate: "invalid date",
                isAllDay: false,
              }),
            },
          },
        ],
      })
      await expect(analyzeSchedule("テスト")).rejects.toThrow("日時の形式が不正です")
    })
  })

  describe("analyzeDateTimeExpression", () => {
    it("正常な日時表現を解析できる", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                startDate: "2024-01-01 14:00",
                endDate: "2024-01-01 15:00",
                isAllDay: false,
              }),
            },
          },
        ],
      })

      const result = await analyzeDateTimeExpression("明日の14時から1時間")
      expect(result).toEqual({
        startDate: expect.any(String),
        endDate: expect.any(String),
        isAllDay: false,
      })
      // 日時形式の��証
      expect(new Date(result.startDate).toISOString()).toBe(result.startDate)
      expect(new Date(result.endDate).toISOString()).toBe(result.endDate)
    })

    it("日時情報が欠けているレスポンスでエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isAllDay: false,
              }),
            },
          },
        ],
      })
      await expect(analyzeDateTimeExpression("テスト")).rejects.toThrow(
        "日時の解析に失敗しました",
      )
    })
  })

  describe("proposeSchedule", () => {
    const mockExistingSchedules = [
      {
        title: "既存のミーティング",
        startDate: "2024-01-01T10:00:00Z",
        endDate: "2024-01-01T11:00:00Z",
        isAllDay: false,
      },
    ]

    it("スケジュールを提案できる", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                proposals: [
                  {
                    startDate: "2024-01-01T14:00:00Z",
                    endDate: "2024-01-01T15:00:00Z",
                    reason: "午後の空き時間を活用",
                  },
                ],
              }),
            },
          },
        ],
      })

      const result = await proposeSchedule("1時間のミーティング", mockExistingSchedules)
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty("reason")
    })

    it("提案が空の場合は空配列を返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                proposals: [],
              }),
            },
          },
        ],
      })

      const result = await proposeSchedule("1時間のミーティング", mockExistingSchedules)
      expect(result).toEqual([])
    })

    it("不正なレスポンス形式でエラーを返す", async () => {
      ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: "invalid json",
            },
          },
        ],
      })

      await expect(
        proposeSchedule("1時間のミーティング", mockExistingSchedules),
      ).rejects.toThrow("スケジュールの提案生成に失敗しました")
    })
  })
})
