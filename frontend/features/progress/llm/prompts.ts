import type { PromptContext } from "./types"

// 進捗分析用のプロンプト
export function generateProgressAnalysisPrompt(context: PromptContext): string {
  return `
あなたはプロジェクト進捗分析の専門家です。以下のプロジェクト状況を分析し、洞察と提案を提供してください。

現在の状況:
- 日付: ${context.currentDate}
- 期間: ${context.timeframe.start} から ${context.timeframe.end}
- 全タスク数: ${context.projectScope.totalTasks}
- 完了タスク数: ${context.projectScope.completedTasks}
- クリティカルタスク数: ${context.projectScope.criticalTasks}
- リスクプロファイル:
  - 高リスク: ${context.riskProfile.highRisks}
  - 中リスク: ${context.riskProfile.mediumRisks}
  - 低リスク: ${context.riskProfile.lowRisks}

以下の形式でJSONレスポンスを生成してください:

{
  "summary": {
    "overallProgress": number, // 0-100の進捗率
    "estimatedCompletion": "YYYY-MM-DD", // 予想完了日
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL", // 全体のリスクレベル
    "confidence": number // 0-1の分析信頼度
  },
  "insights": {
    "strengths": string[], // プロジェクトの強み
    "weaknesses": string[], // プロジェクトの弱み
    "bottlenecks": string[] // ボトルネック
  },
  "recommendations": {
    "immediate": string[], // 即時対応が必要な提案
    "shortTerm": string[], // 短期的な提案
    "longTerm": string[] // 長期的な提案
  },
  "risks": {
    "current": string[], // 現在のリスク
    "potential": string[], // 潜在的なリスク
    "mitigation": string[] // リスク軽減策
  }
}
`
}

// リスク評価用のプロンプト
export function generateRiskAnalysisPrompt(context: PromptContext): string {
  return `
あなたはプロジェクトリスク分析の専門家です。以下のプロジェクト状況からリスクを分析し、評価と対策を提案してください。

現在の状況:
- 日付: ${context.currentDate}
- 期間: ${context.timeframe.start} から ${context.timeframe.end}
- リスクプロファイル:
  - 高リスク: ${context.riskProfile.highRisks}
  - 中リスク: ${context.riskProfile.mediumRisks}
  - 低リスク: ${context.riskProfile.lowRisks}

以下の形式でJSONレスポンスを生成してください:

{
  "riskAnalysis": {
    "criticalRisks": [
      {
        "description": string,
        "impact": string,
        "probability": number, // 0-1
        "mitigation": string[]
      }
    ],
    "potentialRisks": [
      {
        "description": string,
        "triggers": string[],
        "preventiveMeasures": string[]
      }
    ],
    "riskTrends": {
      "increasing": string[],
      "decreasing": string[],
      "stable": string[]
    }
  }
}
`
}

// 提案生成用のプロンプト
export function generateRecommendationPrompt(context: PromptContext): string {
  return `
あなたはプロジェクト改善の専門家です。以下のプロジェクト状況から改善提案を生成してください。

現在の状況:
- 日付: ${context.currentDate}
- 期間: ${context.timeframe.start} から ${context.timeframe.end}
- 全タスク数: ${context.projectScope.totalTasks}
- 完了タスク数: ${context.projectScope.completedTasks}
- クリティカルタスク数: ${context.projectScope.criticalTasks}

以下の形式でJSONレスポンスを生成してください:

{
  "recommendations": {
    "processImprovements": [
      {
        "area": string,
        "suggestion": string,
        "expectedBenefits": string[],
        "implementation": string[]
      }
    ],
    "resourceOptimization": [
      {
        "resource": string,
        "currentUsage": string,
        "optimization": string,
        "impact": string
      }
    ],
    "qualityEnhancements": [
      {
        "aspect": string,
        "improvement": string,
        "steps": string[]
      }
    ]
  }
}
`
}
