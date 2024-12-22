import type { ScheduleUpdateInput } from "@/features/schedule/types"
import { db } from "@/lib/db"
import { scheduleSchema } from "@/lib/validations/schedule"
import { NextResponse } from "next/server"

interface RouteParams {
  params: {
    id: string
  }
}

// スケジュールの取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const schedule = await db.schedule.findUnique({
      where: {
        id: params.id,
      },
      include: {
        participants: true,
        reminders: true,
        recurrence: true,
      },
    })

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 })
    }

    return NextResponse.json(schedule)
  }
  catch (error) {
    console.error("[SCHEDULE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// スケジュールの更新
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const json = await request.json()
    const body = scheduleSchema.partial().parse(json)

    const schedule = await db.schedule.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        isAllDay: body.isAllDay,
        location: body.location,
        status: body.status,
        participants: body.participants
          ? {
              deleteMany: {},
              create: body.participants,
            }
          : undefined,
        reminders: body.reminders
          ? {
              deleteMany: {},
              create: body.reminders,
            }
          : undefined,
        recurrence: body.recurrence
          ? {
              upsert: {
                create: body.recurrence,
                update: body.recurrence,
              },
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
    console.error("[SCHEDULE_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// スケジュールの削除
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await db.schedule.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  }
  catch (error) {
    console.error("[SCHEDULE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
