import type { OpenAIConfigType } from "../config"

/**
 * プロンプトの基本型
 */
export interface BasePrompt {
  systemPrompt: string
  userPrompt: string
  config?: Partial<OpenAIConfigType>
}

/**
 * 事業計画分析プロンプト
 */
export function analyzePlanPrompt(plan: {
  title: string
  description: string
  goals: string[]
  risks: string[]
}): BasePrompt {
  return {
    systemPrompt: `
あなたは事業計画のアナリストとして、以下の観点で分析を行います：
1. 計画の実現可能性
2. 目標の妥当性
3. リスクの評価と対策
4. 改善提案

分析は以下の形式で出力してください：
- 総合評価（5段階）
- 主な強み（3点）
- 主な課題（3点）
- 具体的な改善提案（3点）
- 補足コメント
`,
    userPrompt: `
以下の事業計画を分析してください：

【タイトル】
${plan.title}

【概要】
${plan.description}

【目標】
${plan.goals.map(goal => `- ${goal}`).join("\n")}

【リスク】
${plan.risks.map(risk => `- ${risk}`).join("\n")}
`,
    config: {
      temperature: 0.7,
      maxTokens: 1000,
    },
  }
}

/**
 * KPI分析プロンプト
 */
export function analyzeKPIPrompt(kpiData: {
  metrics: { name: string, actual: number, target: number }[]
  period: string
}): BasePrompt {
  return {
    systemPrompt: `
あなたはKPIアナリストとして、以下の観点で分析を行います：
1. 目標達成度の評価
2. 傾向分析
3. 改善に向けた提案
4. 優先度の提案

分析は以下の形式で出力してください：
- 総合達成度（%）
- 主要な成果（2-3点）
- 注意が必要な指標（2-3点）
- アクションプラン（3点）
- 補足コメント
`,
    userPrompt: `
以下のKPIデータを分析してください：

【期間】
${kpiData.period}

【指標】
${kpiData.metrics
  .map(
    metric =>
      `- ${metric.name}: 実績 ${metric.actual} / 目標 ${metric.target}`,
  )
  .join("\n")}
`,
    config: {
      temperature: 0.3,
      maxTokens: 800,
    },
  }
}

/**
 * リスク分析プロンプト
 */
export function analyzeRiskPrompt(risks: {
  description: string
  impact: "high" | "medium" | "low"
  probability: "high" | "medium" | "low"
}[]): BasePrompt {
  return {
    systemPrompt: `
あなたはリスクマネージャーとして、以下の観点で分析を行います：
1. リスクの優先度評価
2. 対応策の提案
3. モニタリング方法の提案
4. 予防措置の提案

分析は以下の形式で出力してください：
- リスクマトリクス評価
- 最重要リスク（2-3点）
- 具体的な対策案（各リスクに対して）
- モニタリング計画
- 補足コメント
`,
    userPrompt: `
以下のリスクを分析してください：

${risks
  .map(
    risk => `
【リスク】
- 内容: ${risk.description}
- 影響度: ${risk.impact}
- 発生確率: ${risk.probability}
`,
  )
  .join("\n")}
`,
    config: {
      temperature: 0.5,
      maxTokens: 1200,
    },
  }
}
