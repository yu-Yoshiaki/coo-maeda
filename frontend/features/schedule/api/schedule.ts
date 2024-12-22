import type { CreateScheduleInput, Schedule, UpdateScheduleInput } from "../types"

const API_BASE = "/api/schedules"

/**
 * スケジュール一覧を取得
 */
export async function getSchedules(): Promise<Schedule[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  const { data } = await response.json()
  return data
}

/**
 * 特定のスケジュールを取得
 */
export async function getSchedule(id: string): Promise<Schedule> {
  const response = await fetch(`${API_BASE}/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  const { data } = await response.json()
  return data
}

/**
 * 新規スケジュールを作成
 */
export async function createSchedule(input: CreateScheduleInput): Promise<Schedule> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  const { data } = await response.json()
  return data
}

/**
 * スケジュールを更新
 */
export async function updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
  const { data } = await response.json()
  return data
}

/**
 * スケジュールを削除
 */
export async function deleteSchedule(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }
}
