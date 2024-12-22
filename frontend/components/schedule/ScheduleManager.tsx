"use client"

import type { Schedule } from "@/lib/validations/schedule"
import { useEffect, useState } from "react"
import { NaturalLanguageInput } from "./NaturalLanguageInput"
import { ScheduleCalendar } from "./ScheduleCalendar"
import { ScheduleForm } from "./ScheduleForm"

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // スケジュール一覧の取得
  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (!response.ok) {
        throw new Error("スケジュールの取得に失敗しました")
      }
      const data = await response.json()
      setSchedules(data)
    }
    catch (error) {
      console.error("Error fetching schedules:", error)
      alert(error instanceof Error ? error.message : "スケジュールの取得に失敗しました")
    }
  }

  // スケジュールの作成
  const createSchedule = async (data: Partial<Schedule>) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("スケジュールの作成に失敗しました")
      }

      await fetchSchedules()
      setIsEditing(false)
    }
    catch (error) {
      console.error("Error creating schedule:", error)
      alert(error instanceof Error ? error.message : "スケジュールの作成に失敗しました")
    }
    finally {
      setIsLoading(false)
    }
  }

  // スケジュールの更新
  const updateSchedule = async (data: Partial<Schedule>) => {
    if (!selectedSchedule?.id)
      return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/schedules/${selectedSchedule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("スケジュールの更新に失敗しました")
      }

      await fetchSchedules()
      setSelectedSchedule(null)
      setIsEditing(false)
    }
    catch (error) {
      console.error("Error updating schedule:", error)
      alert(error instanceof Error ? error.message : "スケジュールの更新に失敗しました")
    }
    finally {
      setIsLoading(false)
    }
  }

  // スケジュールの削除
  const deleteSchedule = async (id: string) => {
    if (!confirm("このスケジュールを削除してもよろしいですか？"))
      return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("スケジュールの削除に失敗しました")
      }

      await fetchSchedules()
      setSelectedSchedule(null)
    }
    catch (error) {
      console.error("Error deleting schedule:", error)
      alert(error instanceof Error ? error.message : "スケジュールの削除に失敗しました")
    }
    finally {
      setIsLoading(false)
    }
  }

  // スケジュールの選択
  const handleSelectEvent = (event: Schedule) => {
    setSelectedSchedule(event)
    setIsEditing(true)
  }

  // 新規スケジュールの作成
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setSelectedSchedule(null)
    setIsEditing(true)
  }

  // 初期データの取得
  useEffect(() => {
    fetchSchedules()
  }, [])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <ScheduleCalendar
            schedules={schedules}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        <div className="space-y-8">
          <NaturalLanguageInput
            onSubmit={createSchedule}
            isLoading={isLoading}
          />

          {isEditing && (
            <div className="rounded border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {selectedSchedule ? "予定の編集" : "新規予定の作成"}
                </h2>
                {selectedSchedule && (
                  <button
                    onClick={() => deleteSchedule(selectedSchedule.id!)}
                    className="text-sm text-red-600 hover:text-red-700"
                    disabled={isLoading}
                  >
                    削除
                  </button>
                )}
              </div>

              <ScheduleForm
                initialData={selectedSchedule || undefined}
                onSubmit={selectedSchedule ? updateSchedule : createSchedule}
                onCancel={() => {
                  setSelectedSchedule(null)
                  setIsEditing(false)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
