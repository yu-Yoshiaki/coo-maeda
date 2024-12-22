import type { Schedule } from "@/lib/validations/schedule"
import { ScheduleManager } from "@/components/schedule/ScheduleManager"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { act } from "react"

// モックのスケジュール
const mockSchedule = {
  id: "1",
  title: "ミーティング",
  startDate: new Date("2024-01-01T14:00:00").toISOString(),
  endDate: new Date("2024-01-01T15:00:00").toISOString(),
  location: "会議室A",
  isAllDay: false,
}

// react-big-calendarのモック
jest.mock("react-big-calendar", () => ({
  Calendar: ({
    events,
    onSelectEvent,
  }: {
    events: Schedule[]
    onSelectEvent: (event: Schedule) => void
  }) => (
    <div data-testid="mock-calendar">
      {events.map((event: Schedule) => (
        <button key={event.id} onClick={() => onSelectEvent(event)}>
          {event.title}
        </button>
      ))}
    </div>
  ),
  dateFnsLocalizer: () => ({}),
}))

// カスタムフックのモック
const mockCreateSchedule = jest.fn()
const mockUpdateSchedule = jest.fn()
const mockDeleteSchedule = jest.fn()
const mockAnalyzeSchedule = jest.fn()

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

    // テキストを入力
    const input = screen.getByLabelText("予定を自然な言葉で入力")
    fireEvent.change(input, {
      target: { value: "明日の14時から1時間、会議室Aでミーティング" },
    })

    // 解析ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "解析" }))
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockAnalyzeSchedule).toHaveBeenCalled()
      expect(mockCreateSchedule).toHaveBeenCalled()
    })
  })

  it("スケジュールを更新できる", async () => {
    render(<ScheduleManager />)

    // スケジュールを選択
    fireEvent.click(screen.getByText("ミーティング"))

    // テキストを入力
    const input = screen.getByLabelText("予定を自然な言葉で入力")
    fireEvent.change(input, {
      target: { value: "明日の15時から2時間、会議室Bでミーティング" },
    })

    // 解析ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "解析" }))
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockAnalyzeSchedule).toHaveBeenCalled()
      expect(mockUpdateSchedule).toHaveBeenCalled()
    })
  })

  it("スケジュールを削除できる", async () => {
    render(<ScheduleManager />)

    // スケジュールを選択
    fireEvent.click(screen.getByText("ミーティング"))

    // 削除ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "削除" }))
    })

    // APIが呼び出されることを確認
    await waitFor(() => {
      expect(mockDeleteSchedule).toHaveBeenCalled()
    })
  })
})
