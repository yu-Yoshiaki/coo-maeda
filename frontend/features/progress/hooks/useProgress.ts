import type { Milestone, ProgressAlert, ProgressReport, Risk, Task } from "../types"
import { useCallback, useEffect, useState } from "react"
import { ProgressAPI } from "../api/progress"

export function useProgress() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [report, setReport] = useState<ProgressReport | null>(null)
  const [risks, setRisks] = useState<Risk[]>([])
  const [alerts, setAlerts] = useState<ProgressAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProgressAPI.getTasks()
      setTasks(data)
      setError(null)
    }
    catch (err) {
      setError("タスクの取得に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProgressAPI.getMilestones()
      setMilestones(data)
      setError(null)
    }
    catch (err) {
      setError("マイルストーンの取得に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const generateReport = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProgressAPI.generateProgressReport()
      setReport(data)
      setError(null)
    }
    catch (err) {
      setError("レポートの生成に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const updateTaskProgress = useCallback(async (taskId: string, progress: number) => {
    try {
      setLoading(true)
      const updatedTask = await ProgressAPI.updateTaskProgress(taskId, progress)
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task,
      ))
      setError(null)
    }
    catch (err) {
      setError("進捗の更新に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProgressAPI.getRisks()
      setRisks(data)
      setError(null)
    }
    catch (err) {
      setError("リスクの取得に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ProgressAPI.getAlerts()
      setAlerts(data)
      setError(null)
    }
    catch (err) {
      setError("アラートの取得に失敗しました")
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, [])

  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      await ProgressAPI.markAlertAsRead(alertId)
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert,
      ))
      setError(null)
    }
    catch (err) {
      setError("アラートの既読化に失敗しました")
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchMilestones()
    fetchRisks()
    fetchAlerts()
  }, [fetchTasks, fetchMilestones, fetchRisks, fetchAlerts])

  return {
    tasks,
    milestones,
    report,
    risks,
    alerts,
    loading,
    error,
    updateTaskProgress,
    generateReport,
    markAlertAsRead,
    refreshData: {
      tasks: fetchTasks,
      milestones: fetchMilestones,
      risks: fetchRisks,
      alerts: fetchAlerts,
    },
  }
}
