// 進捗管理機能の型定義

// タスクのステータス
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"

// リスクの重要度
export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

// アラートの種類
export type AlertType = "DELAY" | "RISK" | "MILESTONE" | "DEPENDENCY"

// タスク
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  startDate: Date
  dueDate: Date
  assignedTo: string[]
  dependencies: string[]
  progress: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// マイルストーン
export interface Milestone {
  id: string
  title: string
  dueDate: Date
  tasks: string[]
  progress: number
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// リスク
export interface Risk {
  id: string
  title: string
  description: string
  severity: RiskSeverity
  impact: string
  mitigation: string
  relatedTasks: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// アラート
export interface Alert {
  id: string
  type: AlertType
  message: string
  taskId?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// 進捗レポート
export interface ProgressReport {
  id: string
  title: string
  generatedAt: Date
  overallProgress: number
  milestones: string[]
  tasks: string[]
  risks: string[]
  recommendations: string[]
  createdBy: string
}

// APIレスポンス型
export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code: string
    details?: unknown
  }
}

// 進捗更新リクエスト
export interface UpdateProgressRequest {
  taskId: string
  progress: number
  status?: TaskStatus
  notes?: string
}

// 進捗分析結果
export interface ProgressAnalysis {
  currentProgress: number
  estimatedCompletion: Date
  riskFactors: string[]
  recommendations: string[]
  bottlenecks: string[]
}

// 進捗トラッカーの状態
export interface ProgressTrackerState {
  tasks: Task[]
  milestones: Milestone[]
  risks: Risk[]
  alerts: Alert[]
  loading: boolean
  error?: string
}
