import type { Alert, Milestone, Risk, Task } from "../types"
import type { ParserConfig, PromptContext } from "./types"

// プロンプトコンテキストの生成
export function createPromptContext(
  tasks: Task[],
  milestones: Milestone[],
  risks: Risk[],
  alerts: Alert[],
): PromptContext {
  const now = new Date()
  const timeframe = calculateTimeframe(tasks, milestones)
  const projectScope = calculateProjectScope(tasks)
  const riskProfile = calculateRiskProfile(risks)

  return {
    currentDate: now.toISOString(),
    timeframe,
    projectScope,
    riskProfile,
  }
}

// タイムフレームの計算
function calculateTimeframe(tasks: Task[], milestones: Milestone[]) {
  const dates = [
    ...tasks.map(t => t.startDate),
    ...tasks.map(t => t.dueDate),
    ...milestones.map(m => m.dueDate),
  ].map(d => new Date(d))

  return {
    start: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString(),
    end: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString(),
  }
}

// プロジェクトスコープの計算
function calculateProjectScope(tasks: Task[]) {
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "COMPLETED").length,
    criticalTasks: tasks.filter(t => t.progress < 100 && new Date(t.dueDate) < new Date())
      .length,
  }
}

// リスクプロファイルの計算
function calculateRiskProfile(risks: Risk[]) {
  return {
    highRisks: risks.filter(r => r.severity === "HIGH" || r.severity === "CRITICAL")
      .length,
    mediumRisks: risks.filter(r => r.severity === "MEDIUM").length,
    lowRisks: risks.filter(r => r.severity === "LOW").length,
  }
}

// デフォルトのパーサー設定
export const defaultParserConfig: ParserConfig = {
  maxTokens: 1000,
  temperature: 0.3,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

// JSONレスポンスのパース
export function parseJsonResponse(response: string): any {
  try {
    return JSON.parse(response)
  }
  catch (error) {
    console.error("JSONのパースに失敗:", error)
    throw new Error("LLMレスポンスの解析に失敗しました")
  }
}

// 日付の妥当性チェック
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// 進捗率の正規化
export function normalizeProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)))
}

// 信頼度スコアの計算
export function calculateConfidenceScore(
  tasks: Task[],
  risks: Risk[],
  alerts: Alert[],
): number {
  const factors = [
    // タスクの完了度
    tasks.length > 0 ? tasks.filter(t => t.status === "COMPLETED").length / tasks.length : 0,
    // リスクの重要度
    risks.length > 0
      ? 1
      - risks.filter(r => r.severity === "HIGH" || r.severity === "CRITICAL").length
      / risks.length
      : 1,
    // アラートの状態
    alerts.length > 0 ? alerts.filter(a => a.isRead).length / alerts.length : 1,
  ]

  return Number((factors.reduce((sum, factor) => sum + factor, 0) / factors.length).toFixed(2))
}
