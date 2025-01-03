import type {
  Alert,
  ApiResponse,
  Milestone,
  ProgressReport,
  Risk,
  Task,
  UpdateProgressRequest,
} from "../types"
import { db } from "@/lib/db"

// タスク関連のAPI
export const taskApi = {
  // タスク一覧の取得
  async getTasks(): Promise<ApiResponse<Task[]>> {
    try {
      const { data, error } = await db
        .from("progress_tasks")
        .select("*")
        .order("due_date", { ascending: true })

      if (error)
        throw error

      return { data: data as Task[] }
    }
    catch (error) {
      console.error("タスク一覧の取得に失敗:", error)
      return {
        error: {
          message: "タスク一覧の取得に失敗しました",
          code: "FETCH_TASKS_ERROR",
        },
      }
    }
  },

  // タスクの作成
  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy">): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await db
        .from("progress_tasks")
        .insert(task)
        .select()
        .single()

      if (error)
        throw error

      return { data: data as Task }
    }
    catch (error) {
      console.error("タスクの作成に失敗:", error)
      return {
        error: {
          message: "タスクの作成に失敗しました",
          code: "CREATE_TASK_ERROR",
        },
      }
    }
  },

  // タスクの更新
  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await db
        .from("progress_tasks")
        .update(task)
        .eq("id", id)
        .select()
        .single()

      if (error)
        throw error

      return { data: data as Task }
    }
    catch (error) {
      console.error("タスクの更新に失敗:", error)
      return {
        error: {
          message: "タスクの更新に失敗しました",
          code: "UPDATE_TASK_ERROR",
        },
      }
    }
  },

  // タスクの削除
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await db
        .from("progress_tasks")
        .delete()
        .eq("id", id)

      if (error)
        throw error

      return {}
    }
    catch (error) {
      console.error("タスクの削除に失敗:", error)
      return {
        error: {
          message: "タスクの削除に失敗しました",
          code: "DELETE_TASK_ERROR",
        },
      }
    }
  },

  // 進捗の更新
  async updateProgress(request: UpdateProgressRequest): Promise<ApiResponse<Task>> {
    try {
      const { taskId, progress, status, notes } = request
      const updates: Partial<Task> = {
        progress,
        ...(status && { status }),
      }

      const { data, error } = await db
        .from("progress_tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single()

      if (error)
        throw error

      // 進捗更新に関連するアラートを作成
      if (progress < 100 && status === "BLOCKED") {
        await alertApi.createAlert({
          type: "DELAY",
          message: `タスク「${data.title}」が遅延しています`,
          taskId,
        })
      }

      return { data: data as Task }
    }
    catch (error) {
      console.error("進捗の更新に失敗:", error)
      return {
        error: {
          message: "進捗の更新に失敗しました",
          code: "UPDATE_PROGRESS_ERROR",
        },
      }
    }
  },
}

// マイルストーン関連のAPI
export const milestoneApi = {
  // マイルストーン一覧の取得
  async getMilestones(): Promise<ApiResponse<Milestone[]>> {
    try {
      const { data, error } = await db
        .from("progress_milestones")
        .select("*")
        .order("due_date", { ascending: true })

      if (error)
        throw error

      return { data: data as Milestone[] }
    }
    catch (error) {
      console.error("マイルストーン一覧の取得に失敗:", error)
      return {
        error: {
          message: "マイルストーン一覧の取得に失敗しました",
          code: "FETCH_MILESTONES_ERROR",
        },
      }
    }
  },

  // マイルストーンの作成
  async createMilestone(
    milestone: Omit<Milestone, "id" | "createdAt" | "updatedAt" | "createdBy">,
  ): Promise<ApiResponse<Milestone>> {
    try {
      const { data, error } = await db
        .from("progress_milestones")
        .insert(milestone)
        .select()
        .single()

      if (error)
        throw error

      return { data: data as Milestone }
    }
    catch (error) {
      console.error("マイルストーンの作成に失敗:", error)
      return {
        error: {
          message: "マイルストーンの作成に失敗しました",
          code: "CREATE_MILESTONE_ERROR",
        },
      }
    }
  },
}

// リスク関連のAPI
export const riskApi = {
  // リスク一覧の取得
  async getRisks(): Promise<ApiResponse<Risk[]>> {
    try {
      const { data, error } = await db
        .from("progress_risks")
        .select("*")
        .order("severity", { ascending: false })

      if (error)
        throw error

      return { data: data as Risk[] }
    }
    catch (error) {
      console.error("リスク一覧の取得に失敗:", error)
      return {
        error: {
          message: "リスク一覧の取得に失敗しました",
          code: "FETCH_RISKS_ERROR",
        },
      }
    }
  },

  // リスクの作成
  async createRisk(risk: Omit<Risk, "id" | "createdAt" | "updatedAt" | "createdBy">): Promise<ApiResponse<Risk>> {
    try {
      const { data, error } = await db
        .from("progress_risks")
        .insert(risk)
        .select()
        .single()

      if (error)
        throw error

      // 重要度が高いリスクの場合、アラートを作成
      if (data.severity === "HIGH" || data.severity === "CRITICAL") {
        await alertApi.createAlert({
          type: "RISK",
          message: `重要なリスクが登録されました: ${data.title}`,
          taskId: data.relatedTasks[0],
        })
      }

      return { data: data as Risk }
    }
    catch (error) {
      console.error("リスクの作成に失敗:", error)
      return {
        error: {
          message: "リスクの作成に失敗しました",
          code: "CREATE_RISK_ERROR",
        },
      }
    }
  },
}

// アラート関連のAPI
export const alertApi = {
  // アラート一覧の取得
  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    try {
      const response = await fetch("/api/progress/alerts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok)
        throw new Error("アラートの取得に失敗しました")

      const data = await response.json()
      return { data: data as Alert[] }
    }
    catch (error) {
      console.error("アラート一覧の取得に失敗:", error)
      return {
        error: {
          message: "アラート一覧の取得に失敗しました",
          code: "FETCH_ALERTS_ERROR",
        },
      }
    }
  },

  // アラートの作成
  async createAlert(
    alert: Omit<Alert, "id" | "createdAt" | "updatedAt" | "createdBy" | "isRead">,
  ): Promise<ApiResponse<Alert>> {
    try {
      const { data, error } = await db
        .from("progress_alerts")
        .insert({ ...alert, is_read: false })
        .select()
        .single()

      if (error)
        throw error

      return { data: data as Alert }
    }
    catch (error) {
      console.error("アラートの作成に失敗:", error)
      return {
        error: {
          message: "アラートの作成に失敗しました",
          code: "CREATE_ALERT_ERROR",
        },
      }
    }
  },

  // アラートを既読にする
  async markAsRead(id: string): Promise<ApiResponse<Alert>> {
    try {
      const { data, error } = await db
        .from("progress_alerts")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single()

      if (error)
        throw error

      return { data: data as Alert }
    }
    catch (error) {
      console.error("アラートの既読化に失敗:", error)
      return {
        error: {
          message: "アラートの既読化に失敗しました",
          code: "MARK_ALERT_READ_ERROR",
        },
      }
    }
  },
}

// レポート関連のAPI
export const reportApi = {
  // レポートの生成
  async generateReport(): Promise<ApiResponse<ProgressReport>> {
    try {
      // タスクとマイルストーンの情報を取得
      const tasksResponse = await taskApi.getTasks()
      const milestonesResponse = await milestoneApi.getMilestones()
      const risksResponse = await riskApi.getRisks()

      if (tasksResponse.error || milestonesResponse.error || risksResponse.error) {
        throw new Error("データの取得に失敗しました")
      }

      const tasks = tasksResponse.data!
      const milestones = milestonesResponse.data!
      const risks = risksResponse.data!

      // 全体の進捗率を計算
      const overallProgress = Math.round(
        tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length,
      )

      // レポートを作成
      const report = {
        title: `進捗レポート ${new Date().toLocaleDateString()}`,
        overallProgress,
        milestones: milestones.map(m => m.id),
        tasks: tasks.map(t => t.id),
        risks: risks.map(r => r.id),
        recommendations: generateRecommendations(tasks, milestones, risks),
      }

      const { data, error } = await db
        .from("progress_reports")
        .insert(report)
        .select()
        .single()

      if (error)
        throw error

      return { data: data as ProgressReport }
    }
    catch (error) {
      console.error("レポートの生成に失敗:", error)
      return {
        error: {
          message: "レポートの生成に失敗しました",
          code: "GENERATE_REPORT_ERROR",
        },
      }
    }
  },
}

// レコメンデーション生成のヘルパー関数
function generateRecommendations(tasks: Task[], milestones: Milestone[], risks: Risk[]): string[] {
  const recommendations: string[] = []

  // 遅延タスクの確認
  const delayedTasks = tasks.filter(
    task => task.progress < 100 && new Date(task.dueDate) < new Date(),
  )
  if (delayedTasks.length > 0) {
    recommendations.push(
      `${delayedTasks.length}件のタスクが期限を過ぎています。優先的に対応が必要です。`,
    )
  }

  // ブロックされているタスクの確認
  const blockedTasks = tasks.filter(task => task.status === "BLOCKED")
  if (blockedTasks.length > 0) {
    recommendations.push(
      `${blockedTasks.length}件のタスクがブロックされています。ブロック解除の対応が必要です。`,
    )
  }

  // 重要なリスクの確認
  const criticalRisks = risks.filter(risk => risk.severity === "CRITICAL")
  if (criticalRisks.length > 0) {
    recommendations.push(
      `${criticalRisks.length}件のクリティカルなリスクが存在します。早急な対応が必要です。`,
    )
  }

  return recommendations
}
