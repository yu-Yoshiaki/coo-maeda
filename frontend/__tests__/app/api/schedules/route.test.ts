import { GET, POST } from "@/app/api/schedules/route"
import { NextRequest } from "next/server"

// モックスケジュール
const mockSchedule = {
  id: "1",
  title: "ミーティング",
  startDate: "2024-01-01T14:00:00",
  endDate: "2024-01-01T15:00:00",
  location: "会議室A",
  isAllDay: false,
}

// Supabaseのモック
jest.mock("@/lib/supabase", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        or: () => ({
          order: () => ({
            data: [mockSchedule],
            error: null,
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({
            data: mockSchedule,
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe("schedules API", () => {
  it("gETリクエストでスケジュール一覧を取得できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ data: [mockSchedule] })
  })

  it("pOSTリクエストで新しいスケジュールを作成できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules", {
      method: "POST",
      body: JSON.stringify(mockSchedule),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({ data: mockSchedule })
  })

  it("エラー時に適切なレスポンスを返す", async () => {
    // Supabaseのエラーをモック
    jest.mock("@/lib/supabase", () => ({
      createClient: () => ({
        from: () => ({
          select: () => ({
            or: () => ({
              order: () => ({
                data: null,
                error: new Error("Database error"),
              }),
            }),
          }),
        }),
      }),
    }))

    const request = new NextRequest("http://localhost:3000/api/schedules")
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: "スケジュールの取得に失敗しました",
    })
  })
})
