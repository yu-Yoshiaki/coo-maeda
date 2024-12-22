import type {
  Milestone,
  ProgressTrackerState,
  Risk,
  Task,
  UpdateProgressRequest,
} from "../types"
import { useCallback, useEffect, useState } from "react"
import { alertApi, milestoneApi, reportApi, riskApi, taskApi } from "../api/progress"
import {
  Alert,
} from "../types"

export function useProgress() {
  const [state, setState] = useState<ProgressTrackerState>({
    tasks: [],
    milestones: [],
    risks: [],
    alerts: [],
    loading: true,
  })

  // データの初期読み込み
  useEffect(() => {
    loadAllData()
  }, [])

  // 全データの読み込み
  const loadAllData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const [tasksRes, milestonesRes, risksRes, alertsRes] = await Promise.all([
        taskApi.getTasks(),
        milestoneApi.getMilestones(),
        riskApi.getRisks(),
        alertApi.getAlerts(),
      ])

      if (tasksRes.error)
        throw new Error(tasksRes.error.message)
      if (milestonesRes.error)
        throw new Error(milestonesRes.error.message)
      if (risksRes.error)
        throw new Error(risksRes.error.message)
      if (alertsRes.error)
        throw new Error(alertsRes.error.message)

      setState({
        tasks: tasksRes.data!,
        milestones: milestonesRes.data!,
        risks: risksRes.data!,
        alerts: alertsRes.data!,
        loading: false,
      })
    }
    catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
      }))
    }
  }, [])

  // タスクの作成
  const createTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
      const response = await taskApi.createTask(task)
      if (response.data) {
        setState(prev => ({
          ...prev,
          tasks: [...prev.tasks, response.data!],
        }))
      }
      return response
    },
    [],
  )

  // タスクの更新
  const updateTask = useCallback(async (id: string, task: Partial<Task>) => {
    const response = await taskApi.updateTask(id, task)
    if (response.data) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t.id === id ? response.data! : t)),
      }))
    }
    return response
  }, [])

  // タスクの削除
  const deleteTask = useCallback(async (id: string) => {
    const response = await taskApi.deleteTask(id)
    if (!response.error) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id),
      }))
    }
    return response
  }, [])

  // 進捗の更新
  const updateProgress = useCallback(async (request: UpdateProgressRequest) => {
    const response = await taskApi.updateProgress(request)
    if (response.data) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t.id === request.taskId ? response.data! : t)),
      }))
    }
    return response
  }, [])

  // マイルストーンの作成
  const createMilestone = useCallback(
    async (milestone: Omit<Milestone, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
      const response = await milestoneApi.createMilestone(milestone)
      if (response.data) {
        setState(prev => ({
          ...prev,
          milestones: [...prev.milestones, response.data!],
        }))
      }
      return response
    },
    [],
  )

  // リスクの作成
  const createRisk = useCallback(
    async (risk: Omit<Risk, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
      const response = await riskApi.createRisk(risk)
      if (response.data) {
        setState(prev => ({
          ...prev,
          risks: [...prev.risks, response.data!],
        }))
      }
      return response
    },
    [],
  )

  // アラートを既読にする
  const markAlertAsRead = useCallback(async (id: string) => {
    const response = await alertApi.markAsRead(id)
    if (response.data) {
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => (a.id === id ? response.data! : a)),
      }))
    }
    return response
  }, [])

  // レポートの生成
  const generateReport = useCallback(async () => {
    return await reportApi.generateReport()
  }, [])

  // 未読アラートの数を取得
  const getUnreadAlertCount = useCallback(() => {
    return state.alerts.filter(alert => !alert.isRead).length
  }, [state.alerts])

  // 全体の進捗率を計算
  const getOverallProgress = useCallback(() => {
    if (state.tasks.length === 0)
      return 0
    return Math.round(
      state.tasks.reduce((sum, task) => sum + task.progress, 0) / state.tasks.length,
    )
  }, [state.tasks])

  return {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    updateProgress,
    createMilestone,
    createRisk,
    markAlertAsRead,
    generateReport,
    getUnreadAlertCount,
    getOverallProgress,
    refresh: loadAllData,
  }
}
