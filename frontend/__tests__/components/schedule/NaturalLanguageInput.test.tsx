import { NaturalLanguageInput } from "@/components/schedule/NaturalLanguageInput"
import { fireEvent, render, screen } from "@testing-library/react"

// モックのレスポンス
const mockSchedule = {
  title: "ミーティング",
  startDate: "2024-01-01T14:00:00",
  endDate: "2024-01-01T15:00:00",
  location: "会議室A",
  isAllDay: false,
}

// fetchのモック
global.fetch = jest.fn()

describe("naturalLanguageInput", () => {
  it("入力フォームが正しくレンダリングされる", () => {
    render(<NaturalLanguageInput />)

    expect(screen.getByLabelText("予定を自然な言葉で入力")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "解析" })).toBeInTheDocument()
  })

  it("テキストの入力が可能", () => {
    render(<NaturalLanguageInput />)

    const input = screen.getByLabelText("予定を自然な言葉で入力")
    fireEvent.change(input, {
      target: { value: "明日の14時から1時間、会議室Aでミーティング" },
    })

    expect(input).toHaveValue("明日の14時から1時間、会議室Aでミーティング")
  })

  it("フォーム送信時に正しく処理される", async () => {
    const mockOnSubmit = jest.fn()
    render(<NaturalLanguageInput onSubmit={mockOnSubmit} />)

    // テキストエリアに入力
    const textarea = screen.getByRole("textbox", { name: "予定を自然な言葉で入力" })
    fireEvent.change(textarea, {
      target: { value: "明日の14時から1時間、会議室Aでミーティング" },
    })

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "解析" })
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith(
      "明日の14時から1時間、会議室Aでミーティング",
    )
  })

  it("aPIエラー時にエラーメッセージが表示される", async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error("API Error"))
    render(<NaturalLanguageInput onSubmit={mockOnSubmit} />)

    // テキストエリアに入力
    const textarea = screen.getByRole("textbox", { name: "予定を自然な言葉で入力" })
    fireEvent.change(textarea, {
      target: { value: "invalid input" },
    })

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "解析" })
    fireEvent.click(submitButton)

    // エラーメッセージが表示されることを確認
    const errorMessage = await screen.findByText("予定の解析に失敗しました")
    expect(errorMessage).toBeInTheDocument()
  })
})
