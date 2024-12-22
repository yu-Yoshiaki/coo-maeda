import { DELETE, GET, PUT } from "@/app/api/schedules/[id]/route"
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
        eq: () => ({
          single: () => ({
            data: mockSchedule,
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: mockSchedule,
              error: null,
            }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          then: () => ({
            data: null,
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe("schedule API", () => {
  const params = { id: "1" }

  it("gETリクエストで特定のスケジュールを取得できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules/1")
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ data: mockSchedule })
  })

  it("pUTリクエストでスケジュールを更新できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules/1", {
      method: "PUT",
      body: JSON.stringify({ title: "更新されたミーティング" }),
    })
    const response = await PUT(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ data: mockSchedule })
  })

  it("dELETEリクエストでスケジュールを削除できる", async () => {
    const request = new NextRequest("http://localhost:3000/api/schedules/1", {
      method: "DELETE",
    })
    const response = await DELETE(request, { params })

    expect(response.status).toBe(204)
  })

  it("存在しないスケジュールにアクセスするとエラーを返す", async () => {
    // Supabaseのエラーをモック
    jest.mock("@/lib/supabase", () => ({
      createClient: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({
                data: null,
                error: new Error("Not found"),
              }),
            }),
          }),
        }),
      }),
    }))

    const request = new NextRequest("http://localhost:3000/api/schedules/999")
    const response = await GET(request, { params: { id: "999" } })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: "スケジュールが見つかりません",
    })
  })
})
