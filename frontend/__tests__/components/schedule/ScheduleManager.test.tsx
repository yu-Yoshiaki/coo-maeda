import { ScheduleManager } from "@/components/schedule/ScheduleManager"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { act } from "react"

// モックの設定
const mockCreateSchedule = jest.fn()
const mockUpdateSchedule = jest.fn()
const mockDeleteSchedule = jest.fn()
const mockAnalyzeSchedule = jest.fn()

// モックスケジュール
const mockSchedule = {
  id: "1",
  title: "ミーティング",
  startDate: "2024-01-01T14:00:00",
  endDate: "2024-01-01T15:00:00",
  location: "会議室A",
  isAllDay: false,
}

// モックの設定
jest.mock("@/hooks/schedule/useSchedule", () => ({
  useSchedule: () => ({
    schedules: [mockSchedule],
    loading: false,
    error: null,
    createSchedule: mockCreateSchedule,
    updateSchedule: mockUpdateSchedule,
    deleteSchedule: mockDeleteSchedule,
  }),
}))

jest.mock("@/hooks/schedule/useScheduleAnalyzer", () => ({
  useScheduleAnalyzer: () => ({
    analyzeSchedule: mockAnalyzeSchedule,
  }),
}))

describe("scheduleManager", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAnalyzeSchedule.mockResolvedValue(mockSchedule)
  })

  it("スケジュールを作成できる", async () => {
    render(<ScheduleManager />)

    // テキストエリアに予定を入力
    const input = screen.getByRole("textbox")
    fireEvent.change(input, {
      target: { value: "明日の14時から1時間、会議室Aでミーティング" },
    })

    // 解析ボタンをクリック
    const button = screen.getByRole("button", { name: "解析" })
    await act(async () => {
      fireEvent.click(button)
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockAnalyzeSchedule).toHaveBeenCalled()
      expect(mockCreateSchedule).toHaveBeenCalled()
    })
  })

  it("スケジュールを更新できる", async () => {
    render(<ScheduleManager />)

    // カレンダーのイベントをクリック
    const calendar = screen.getByRole("grid")
    const event = calendar.querySelector(".rbc-event")
    if (event) {
      await act(async () => {
        fireEvent.click(event)
      })
    }

    // テキストエリアに予定を入力
    const input = screen.getByRole("textbox")
    fireEvent.change(input, {
      target: { value: "明日の15時から2時間、会議室Bでミーティング" },
    })

    // 解析ボタンをクリック
    const button = screen.getByRole("button", { name: "解析" })
    await act(async () => {
      fireEvent.click(button)
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockAnalyzeSchedule).toHaveBeenCalled()
      expect(mockUpdateSchedule).toHaveBeenCalled()
    })
  })

  it("スケジュールを削除できる", async () => {
    render(<ScheduleManager />)

    // カレンダーのイベントをクリック
    const calendar = screen.getByRole("grid")
    const event = calendar.querySelector(".rbc-event")
    if (event) {
      await act(async () => {
        fireEvent.click(event)
      })
    }

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole("button", { name: "削除" })
    await act(async () => {
      fireEvent.click(deleteButton)
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockDeleteSchedule).toHaveBeenCalled()
    })
  })
})
