import { useScheduleAnalyzer } from "@/hooks/schedule/useScheduleAnalyzer"
import { renderHook } from "@testing-library/react"

// モックのスケジュール
const mockSchedule = {
  title: "ミーティング",
  startDate: "2024-01-01T14:00:00",
  endDate: "2024-01-01T15:00:00",
  location: "会議室A",
  isAllDay: false,
}

// fetchのモック
globalThis.fetch = jest.fn()

describe("useScheduleAnalyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("自然言語テキストからスケジュールを解析できる", async () => {
    ;(globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchedule),
      }),
    )

    const { result } = renderHook(() => useScheduleAnalyzer())

    const schedule = await result.current.analyzeSchedule(
      "明日の14時から1時間、会議室Aでミーティング",
    )

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/schedule/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "明日の14時から1時間、会議室Aでミーティング" }),
    })

    expect(schedule).toEqual(mockSchedule)
  })

  it("aPIエラー時に適切にエラーをスローする", async () => {
    ;(globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "予定の解析に失敗しました" }),
      }),
    )

    const { result } = renderHook(() => useScheduleAnalyzer())

    await expect(
      result.current.analyzeSchedule("invalid input"),
    ).rejects.toThrow("予定の解析に失敗しました")
  })

  it("ネットワークエラー時に適切にエラーをスローする", async () => {
    ;(globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error")),
    )

    const { result } = renderHook(() => useScheduleAnalyzer())

    await expect(
      result.current.analyzeSchedule("some text"),
    ).rejects.toThrow("予定の解析に失敗しました")
  })
})
