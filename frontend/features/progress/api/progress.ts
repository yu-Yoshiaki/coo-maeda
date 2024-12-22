import type { Milestone, ProgressAlert, ProgressReport, Risk, Task } from "../types"

export class ProgressAPI {
  private static BASE_URL = "/api/progress"

  static async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.BASE_URL}/tasks`)
    if (!response.ok)
      throw new Error("Failed to fetch tasks")
    return response.json()
  }

  static async getTask(id: string): Promise<Task> {
    const response = await fetch(`${this.BASE_URL}/tasks/${id}`)
    if (!response.ok)
      throw new Error("Failed to fetch task")
    return response.json()
  }

  static async updateTaskProgress(id: string, progress: number): Promise<Task> {
    const response = await fetch(`${this.BASE_URL}/tasks/${id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    })
    if (!response.ok)
      throw new Error("Failed to update task progress")
    return response.json()
  }

  static async getMilestones(): Promise<Milestone[]> {
    const response = await fetch(`${this.BASE_URL}/milestones`)
    if (!response.ok)
      throw new Error("Failed to fetch milestones")
    return response.json()
  }

  static async generateProgressReport(): Promise<ProgressReport> {
    const response = await fetch(`${this.BASE_URL}/reports/generate`, {
      method: "POST",
    })
    if (!response.ok)
      throw new Error("Failed to generate progress report")
    return response.json()
  }

  static async getRisks(): Promise<Risk[]> {
    const response = await fetch(`${this.BASE_URL}/risks`)
    if (!response.ok)
      throw new Error("Failed to fetch risks")
    return response.json()
  }

  static async getAlerts(): Promise<ProgressAlert[]> {
    const response = await fetch(`${this.BASE_URL}/alerts`)
    if (!response.ok)
      throw new Error("Failed to fetch alerts")
    return response.json()
  }

  static async markAlertAsRead(id: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/alerts/${id}/read`, {
      method: "PUT",
    })
    if (!response.ok)
      throw new Error("Failed to mark alert as read")
  }
}
