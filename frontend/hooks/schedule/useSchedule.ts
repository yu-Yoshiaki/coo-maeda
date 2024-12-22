import type {
  NaturalLanguageScheduleInput,
  ScheduleCreateInput,
  ScheduleFilter,
  ScheduleUpdateInput,
} from "@/types/schedule"
import { scheduleApi } from "@/features/api/schedule"
import {
  Schedule,
} from "@/types/schedule"
import { useCallback, useState } from "react"

export function useSchedule() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // スケジュールの作成
  const createSchedule = useCallback(async (input: ScheduleCreateInput) => {
    setLoading(true)
    setError(null)
    try {
      const schedule = await scheduleApi.createSchedule(input)
      return schedule
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // スケジュールの更新
  const updateSchedule = useCallback(async (id: string, input: ScheduleUpdateInput) => {
    setLoading(true)
    setError(null)
    try {
      const schedule = await scheduleApi.updateSchedule(id, input)
      return schedule
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // スケジュールの削除
  const deleteSchedule = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await scheduleApi.deleteSchedule(id)
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // スケジュールの取得
  const getSchedule = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const schedule = await scheduleApi.getSchedule(id)
      return schedule
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // スケジュール一覧の取得
  const getSchedules = useCallback(async (filter: ScheduleFilter) => {
    setLoading(true)
    setError(null)
    try {
      const schedules = await scheduleApi.getSchedules(filter)
      return schedules
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // 自然言語からのスケジュール作成
  const createFromNaturalLanguage = useCallback(async (input: NaturalLanguageScheduleInput) => {
    setLoading(true)
    setError(null)
    try {
      const schedule = await scheduleApi.createFromNaturalLanguage(input)
      return schedule
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  // 外部カレンダーとの同期
  const syncWithExternalCalendar = useCallback(async (calendarId: string) => {
    setLoading(true)
    setError(null)
    try {
      await scheduleApi.syncWithExternalCalendar(calendarId)
    }
    catch (err) {
      setError(err as Error)
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
    getSchedules,
    createFromNaturalLanguage,
    syncWithExternalCalendar,
  }
}
