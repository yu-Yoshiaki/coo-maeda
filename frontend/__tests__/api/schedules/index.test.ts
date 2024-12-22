import { GET, POST } from "@/app/api/schedules/route"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMocks } from "node-mocks-http"

// モックの設定
jest.mock("@/lib/auth")
jest.mock("@/lib/db")

describe("schedule API", () => {
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

  describe("gET /api/schedules", () => {
    it("認証されていない場合は401を返す", async () => {
      ;(auth as jest.Mock).mockResolvedValueOnce(null)
      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe("UNAUTHORIZED")
    })

    it("スケジュール一覧を取得できる", async () => {
      const mockSchedules = [
        {
          id: "1",
          title: "テストスケジュール1",
          start_date: "2024-01-01T09:00:00Z",
          end_date: "2024-01-01T10:00:00Z",
          created_by: "test-user-id",
        },
        {
          id: "2",
          title: "テストスケジュール2",
          start_date: "2024-01-02T09:00:00Z",
          end_date: "2024-01-02T10:00:00Z",
          created_by: "test-user-id",
        },
      ]

      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockSchedules,
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].title).toBe("テストスケジュール1")
    })

    it("データベースエラーの場合は500を返す", async () => {
      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Database error"),
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe("INTERNAL_SERVER_ERROR")
    })
  })

  describe("pOST /api/schedules", () => {
    it("認証されていない場合は401を返す", async () => {
      ;(auth as jest.Mock).mockResolvedValueOnce(null)
      const { req } = createMocks({
        method: "POST",
        body: {
          title: "新しいスケジュール",
          startDate: "2024-01-01T09:00:00Z",
          endDate: "2024-01-01T10:00:00Z",
        },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe("UNAUTHORIZED")
    })

    it("新しいスケジュールを作成できる", async () => {
      const newSchedule = {
        title: "新しいスケジュール",
        startDate: "2024-01-01T09:00:00Z",
        endDate: "2024-01-01T10:00:00Z",
        isAllDay: false,
      }

      ;(db.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...newSchedule, id: "1", created_by: "test-user-id" },
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "POST",
        body: newSchedule,
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.title).toBe(newSchedule.title)
    })

    it("バリデーションエラーの場合は400を返す", async () => {
      const { req } = createMocks({
        method: "POST",
        body: {
          // titleが欠けている
          startDate: "2024-01-01T09:00:00Z",
          endDate: "2024-01-01T10:00:00Z",
        },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe("VALIDATION_ERROR")
    })

    it("データベースエラーの場合は500を返す", async () => {
      const newSchedule = {
        title: "新しいスケジュール",
        startDate: "2024-01-01T09:00:00Z",
        endDate: "2024-01-01T10:00:00Z",
        isAllDay: false,
      }

      ;(db.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Database error"),
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "POST",
        body: newSchedule,
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe("INTERNAL_SERVER_ERROR")
    })
  })
})
