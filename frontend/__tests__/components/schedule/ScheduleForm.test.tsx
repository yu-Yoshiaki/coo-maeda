import { ScheduleForm } from "@/components/schedule/ScheduleForm"
import { fireEvent, render, screen } from "@testing-library/react"

describe("scheduleForm", () => {
  const mockInitialData = {
    title: "ミーティング",
    description: "プロジェクトの進捗確認",
    startDate: "2024-01-01T14:00",
    endDate: "2024-01-01T15:00",
    location: "会議室A",
    isAllDay: false,
  }

  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("初期データが正しく表示される", () => {
    render(
      <ScheduleForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    )

    expect(screen.getByLabelText("タイトル")).toHaveValue(mockInitialData.title)
    expect(screen.getByLabelText("説明")).toHaveValue(mockInitialData.description)
    expect(screen.getByLabelText("開始日時")).toHaveValue(mockInitialData.startDate)
    expect(screen.getByLabelText("終了日時")).toHaveValue(mockInitialData.endDate)
    expect(screen.getByLabelText("終日")).not.toBeChecked()
    expect(screen.getByLabelText("場所")).toHaveValue(mockInitialData.location)
  })

  it("フォーム送信時に正しく処理される", async () => {
    render(
      <ScheduleForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    )

    // フォームを送信
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    // onSubmitが呼び出されることを確認
    expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialData)
  })

  it("キャンセルボタンをクリックするとonCancelが呼び出される", () => {
    render(
      <ScheduleForm
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    )

    // キャンセルボタンをクリック
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }))

    // onCancelが呼び出されることを確認
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
