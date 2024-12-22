import { useSchedule } from "@/hooks/schedule/useSchedule"
import { act, renderHook } from "@testing-library/react"

// モックスケジュール
const mockSchedules = [
  {
    id: "1",
    title: "ミーティング",
    startDate: "2024-01-01T14:00:00",
    endDate: "2024-01-01T15:00:00",
    location: "会議室A",
    isAllDay: false,
  },
]

// fetchのモック
globalThis.fetch = jest.fn()

describe("useSchedule", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(globalThis.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchedules),
      }),
    )
  })

  it("初期状態で正しくスケジュールを取得する", async () => {
    const { result } = renderHook(() => useSchedule())

    expect(result.current.loading).toBe(true)
    expect(result.current.schedules).toEqual([])

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.schedules).toEqual(mockSchedules)
  })

  it("スケジュールを作成できる", async () => {
    const { result } = renderHook(() => useSchedule())

    await act(async () => {
      await result.current.createSchedule(mockSchedules[0])
    })

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockSchedules[0]),
    })
  })

  it("スケジュールを更新できる", async () => {
    const { result } = renderHook(() => useSchedule())
    const updatedSchedule = { ...mockSchedules[0], title: "更新されたミーティング" }

    await act(async () => {
      await result.current.updateSchedule("1", updatedSchedule)
    })

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/schedules/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSchedule),
    })
  })

  it("スケジュールを削除できる", async () => {
    const { result } = renderHook(() => useSchedule())

    await act(async () => {
      await result.current.deleteSchedule("1")
    })

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/schedules/1", {
      method: "DELETE",
    })
  })

  it("エラー時に適切に処理する", async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error")),
    )

    const { result } = renderHook(() => useSchedule())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })
})
