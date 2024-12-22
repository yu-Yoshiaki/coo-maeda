import type { Schedule } from "@/lib/validations/schedule"
import { useEffect, useState } from "react"

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/schedules")
      if (!response.ok) {
        throw new Error("スケジュールの取得に失敗しました")
      }
      const data = await response.json()
      setSchedules(data)
    }
    catch (error) {
      console.error("Error fetching schedules:", error)
      setError(error instanceof Error ? error : new Error("スケジュールの取得に失敗しました"))
    }
    finally {
      setLoading(false)
    }
  }

  const createSchedule = async (input: Partial<Schedule>): Promise<Schedule> => {
    try {
      setLoading(true)
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("スケジュールの作成に失敗しました")
      }

      const data = await response.json()
      await fetchSchedules()
      return data
    }
    catch (error) {
      console.error("Error creating schedule:", error)
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  const updateSchedule = async (id: string, input: Partial<Schedule>): Promise<Schedule> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("スケジュールの更新に失敗しました")
      }

      const data = await response.json()
      await fetchSchedules()
      return data
    }
    catch (error) {
      console.error("Error updating schedule:", error)
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  const deleteSchedule = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("スケジュールの削除に失敗しました")
      }

      await fetchSchedules()
    }
    catch (error) {
      console.error("Error deleting schedule:", error)
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
