/**
 * 事業計画の型定義
 */
export interface BusinessPlan {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: "draft" | "in_progress" | "completed" | "cancelled"
  context: {
    what: string
    when: string
    where: string
    how: string
    who: string
    why: string
  }
  userId: string
  createdAt: string
  updatedAt: string
  action_items?: ActionItem[]
}

/**
 * アクションアイテムの型定義
 */
export interface ActionItem {
  id?: string
  businessPlanId?: string
  title: string
  description: string
  startDate: string
  dueDate: string
  status: "todo" | "in_progress" | "completed"
  resources: string[]
}

/**
 * リスクの型定義
 */
export interface Risk {
  id?: string
  businessPlanId?: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  probability: "high" | "medium" | "low"
  mitigation: string
}

/**
 * マイルストーンの型定義
 */
export interface Milestone {
  id?: string
  businessPlanId?: string
  title: string
  description: string
  dueDate: string
  status: "pending" | "completed"
}

/**
 * 事業計画の入力型定義
 */
export interface BusinessPlanInput {
  title: string
  description: string
  startDate: string
  endDate: string
  status: "draft"
  context: {
    what: string
    when: string
    where: string
    how: string
    who: string
    why: string
  }
  actionItems?: ActionItem[]
  risks?: Risk[]
  milestones?: Milestone[]
}

/**
 * 事業計画APIレスポンスの型定義
 */
export interface BusinessPlanResponse {
  data?: BusinessPlan
  error?: string
  status: "success" | "error" | "loading" | "pending"
  message?: string
}
