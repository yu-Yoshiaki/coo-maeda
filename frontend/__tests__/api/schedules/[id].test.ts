import { DELETE, GET, PUT } from "@/app/api/schedules/[id]/route"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMocks } from "node-mocks-http"

// モックの設定
jest.mock("@/lib/auth")
jest.mock("@/lib/db")

describe("schedule API - Individual Operations", () => {
  const mockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  }

  const mockParams = {
    id: "test-schedule-id",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(auth as jest.Mock).mockResolvedValue(mockSession)
  })

  describe("gET /api/schedules/[id]", () => {
    it("認証されていない場合は401を返す", async () => {
      ;(auth as jest.Mock).mockResolvedValueOnce(null)
      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe("UNAUTHORIZED")
    })

    it("存在するスケジュールを取得できる", async () => {
      const mockSchedule = {
        id: mockParams.id,
        title: "テストスケジュール",
        start_date: "2024-01-01T09:00:00Z",
        end_date: "2024-01-01T10:00:00Z",
        created_by: mockSession.user.id,
      }

      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSchedule,
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.id).toBe(mockParams.id)
      expect(data.data.title).toBe(mockSchedule.title)
    })

    it("存在しないスケジュールの場合は404を返す", async () => {
      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "GET",
      })

      const response = await GET(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe("NOT_FOUND")
    })
  })

  describe("pUT /api/schedules/[id]", () => {
    it("認証されていない場合は401を返す", async () => {
      ;(auth as jest.Mock).mockResolvedValueOnce(null)
      const { req } = createMocks({
        method: "PUT",
        body: {
          title: "更新されたスケジュール",
        },
      })

      const response = await PUT(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe("UNAUTHORIZED")
    })

    it("スケジュールを更新できる", async () => {
      const mockSchedule = {
        id: mockParams.id,
        title: "テストスケジュール",
        created_by: mockSession.user.id,
      }

      const updateData = {
        title: "更新されたスケジュール",
      }

      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSchedule,
              error: null,
            }),
          }),
        }),
      })

      ;(db.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockSchedule, ...updateData },
                error: null,
              }),
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "PUT",
        body: updateData,
      })

      const response = await PUT(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.title).toBe(updateData.title)
    })

    it("存在しないスケジュールの場合は404を返す", async () => {
      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "PUT",
        body: {
          title: "更新されたスケジュール",
        },
      })

      const response = await PUT(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe("NOT_FOUND")
    })
  })

  describe("dELETE /api/schedules/[id]", () => {
    it("認証されていない場合は401を返す", async () => {
      ;(auth as jest.Mock).mockResolvedValueOnce(null)
      const { req } = createMocks({
        method: "DELETE",
      })

      const response = await DELETE(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe("UNAUTHORIZED")
    })

    it("スケジュールを削除できる", async () => {
      const mockSchedule = {
        id: mockParams.id,
        title: "テストスケジュール",
        created_by: mockSession.user.id,
      }

      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSchedule,
              error: null,
            }),
          }),
        }),
      })

      ;(db.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const { req } = createMocks({
        method: "DELETE",
      })

      const response = await DELETE(req, { params: mockParams })

      expect(response.status).toBe(204)
    })

    it("存在しないスケジュールの場合は404を返す", async () => {
      ;(db.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const { req } = createMocks({
        method: "DELETE",
      })

      const response = await DELETE(req, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe("NOT_FOUND")
    })
  })
})
