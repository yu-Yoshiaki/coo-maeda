export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  startDate: Date
  dueDate: Date
  assignedTo: string[]
  dependencies: string[] // 依存タスクのID配列
  progress: number // 0-100の進捗率
  createdAt: Date
  updatedAt: Date
}

export enum TaskStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  COMPLETED = "COMPLETED",
}

export interface Milestone {
  id: string
  title: string
  dueDate: Date
  tasks: string[] // マイルストーンに関連するタスクのID配列
  progress: number
  status: TaskStatus
}

export interface ProgressReport {
  id: string
  title: string
  generatedAt: Date
  overallProgress: number
  milestones: Milestone[]
  tasks: Task[]
  risks: Risk[]
  recommendations: string[]
}

export interface Risk {
  id: string
  title: string
  description: string
  severity: RiskSeverity
  impact: string
  mitigation: string
  relatedTasks: string[] // 関連タスクのID配列
}

export enum RiskSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ProgressAlert {
  id: string
  type: AlertType
  message: string
  taskId?: string
  createdAt: Date
  isRead: boolean
}

export enum AlertType {
  DELAY = "DELAY",
  RISK = "RISK",
  MILESTONE = "MILESTONE",
  DEPENDENCY = "DEPENDENCY",
}
