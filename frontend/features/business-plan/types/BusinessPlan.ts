export type BusinessPlanStatus = "draft" | "in_progress" | "completed" | "cancelled"
export type ActionItemStatus = "todo" | "in_progress" | "completed"
export type MilestoneStatus = "pending" | "completed"

export interface ActionItem {
  id: string
  title: string
  description: string | null
  status: ActionItemStatus
  start_date: string | null
  due_date: string | null
  resources?: string[]
  business_plan_id: string
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  due_date: string
  status: MilestoneStatus
  business_plan_id: string
  created_at: string
  updated_at: string
}

export interface BusinessPlan {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: string
  context?: {
    what?: string
    when?: string
    where?: string
    who?: string
    why?: string
    how?: string
  }
  action_items?: ActionItem[]
  milestones?: Milestone[]
  created_at: string
  updated_at: string
}

export type BusinessPlanInput = Omit<BusinessPlan, "id" | "createdAt" | "updatedAt">

export interface Risk {
  title: string
  description: string
  impact: "low" | "medium" | "high"
  probability: "low" | "medium" | "high"
  mitigation: string
}

export interface AIAnalysisResponse {
  actionItems: ActionItem[]
  risks: Risk[]
}
