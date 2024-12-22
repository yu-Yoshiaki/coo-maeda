import { POST } from "@/app/api/schedules/natural-language/route"
import { auth } from "@/lib/auth"
import { createMocks } from "node-mocks-http"
import OpenAI from "openai"

// モックの設定
jest.mock("@/lib/auth")
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

describe("schedule Natural Language API", () => {
  const mockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue(mockSession)
  })

  it("認証されていない場合は401を返す", async () => {
    ;(auth as jest.Mock).mockResolvedValueOnce(null)
    const { req } = createMocks({
      method: "POST",
      body: {
        text: "明日の午前10時から2時間、会議室Aでプロジェクトミーティング",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe("UNAUTHORIZED")
  })

  it("自然言語テキストから予定を解析できる", async () => {
    const mockAnalysisResult = {
      title: "プロジェクトミーティング",
      description: "プロジェクトミーティング",
      startDate: "2024-01-23T10:00:00Z",
      endDate: "2024-01-23T12:00:00Z",
      isAllDay: false,
      location: "会議室A",
      participants: [],
    }

    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify(mockAnalysisResult),
          },
        },
      ],
    })

    const { req } = createMocks({
      method: "POST",
      body: {
        text: "明日の午前10時から2時間、会議室Aでプロジェクトミーティング",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockAnalysisResult)
  })

  it("テキストが空の場合は400を返す", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        text: "",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("VALIDATION_ERROR")
  })

  it("openAIのレスポンスが不正な場合は500を返す", async () => {
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
      choices: [],
    })

    const { req } = createMocks({
      method: "POST",
      body: {
        text: "明日の午前10時から2時間、会議室Aでプロジェクトミーティング",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR")
  })

  it("openAIがエラーを返した場合は500を返す", async () => {
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValueOnce(
      new Error("OpenAI API error"),
    )

    const { req } = createMocks({
      method: "POST",
      body: {
        text: "明日の午前10時から2時間、会議室Aでプロジェクトミーティング",
      },
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR")
  })
})
