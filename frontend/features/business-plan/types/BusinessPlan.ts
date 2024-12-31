export type BusinessPlanStatus = "draft" | "in_progress" | "completed" | "cancelled"
export type ActionItemStatus = "todo" | "in_progress" | "completed"
export type MilestoneStatus = "pending" | "completed"

export interface ActionItem {
  id: string
  title: string
  description: string
  startDate: string
  dueDate: string
  status: ActionItemStatus
  resources: string[]
  milestoneId?: string
  businessPlanId: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  businessPlanId: string
  createdAt: string
  updatedAt: string
}

export interface BusinessPlan {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: BusinessPlanStatus
  context: {
    what: string
    when: string
    where: string
    who: string
    why: string
    how: string
  }
  userId: string
  createdAt: string
  updatedAt: string
  actionItems?: ActionItem[]
  milestones?: Milestone[]
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
