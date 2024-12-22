import type { ScheduleCreateInput, ScheduleFilter } from "@/features/schedule/types"
import { db } from "@/lib/db"
import { scheduleSchema } from "@/lib/validations/schedule"
import { NextResponse } from "next/server"

// スケジュール一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter: ScheduleFilter = {
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      status: searchParams.get("status")?.split(",") as any,
      participantId: searchParams.get("participantId") ?? undefined,
      searchQuery: searchParams.get("q") ?? undefined,
    }

    const schedules = await db.schedule.findMany({
      where: {
        AND: [
          filter.startDate ? { startDate: { gte: filter.startDate } } : {},
          filter.endDate ? { endDate: { lte: filter.endDate } } : {},
          filter.status ? { status: { in: filter.status } } : {},
          filter.participantId
            ? { participants: { some: { id: filter.participantId } } }
            : {},
          filter.searchQuery
            ? {
                OR: [
                  { title: { contains: filter.searchQuery } },
                  { description: { contains: filter.searchQuery } },
                ],
              }
            : {},
        ],
      },
      include: {
        participants: true,
        reminders: true,
      },
    })

    return NextResponse.json(schedules)
  }
  catch (error) {
    console.error("[SCHEDULES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// スケジュールの作成
export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = scheduleSchema.parse(json)

    const schedule = await db.schedule.create({
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        isAllDay: body.isAllDay,
        location: body.location,
        status: body.status,
        createdBy: body.createdBy,
        participants: {
          create: body.participants,
        },
        reminders: {
          create: body.reminders,
        },
        recurrence: body.recurrence
          ? {
              create: body.recurrence,
            }
          : undefined,
      },
      include: {
        participants: true,
        reminders: true,
        recurrence: true,
      },
    })

    return NextResponse.json(schedule)
  }
  catch (error) {
    console.error("[SCHEDULES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
