import type { Alert, Milestone, Risk, Task } from "../types"

// LLM分析のリクエスト型
export interface AnalysisRequest {
  tasks: Task[]
  milestones: Milestone[]
  risks: Risk[]
  alerts: Alert[]
}

// LLM分析の結果型
export interface AnalysisResult {
  summary: {
    overallProgress: number
    estimatedCompletion: string
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    confidence: number
  }
  insights: {
    strengths: string[]
    weaknesses: string[]
    bottlenecks: string[]
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  risks: {
    current: string[]
    potential: string[]
    mitigation: string[]
  }
}

// LLMプロンプトのコンテキスト
export interface PromptContext {
  currentDate: string
  timeframe: {
    start: string
    end: string
  }
  projectScope: {
    totalTasks: number
    completedTasks: number
    criticalTasks: number
  }
  riskProfile: {
    highRisks: number
    mediumRisks: number
    lowRisks: number
  }
}

// LLMレスポンスのパーサー設定
export interface ParserConfig {
  maxTokens: number
  temperature: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}
