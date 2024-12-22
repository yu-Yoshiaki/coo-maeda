import type {
  AnalysisRequest,
  AnalysisResult,
  ParserConfig,
  PromptContext,
} from "./types"
import OpenAI from "openai"
import {
  generateProgressAnalysisPrompt,
  generateRecommendationPrompt,
  generateRiskAnalysisPrompt,
} from "./prompts"
import {
  calculateConfidenceScore,
  createPromptContext,
  defaultParserConfig,
  isValidDate,
  normalizeProgress,
  parseJsonResponse,
} from "./utils"

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class ProgressAnalyzer {
  private config: ParserConfig

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = { ...defaultParserConfig, ...config }
  }

  // 進捗分析の実行
  async analyzeProgress(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      const context = createPromptContext(
        request.tasks,
        request.milestones,
        request.risks,
        request.alerts,
      )

      // 進捗分析の実行
      const progressAnalysis = await this.runProgressAnalysis(context)

      // リスク分析の実行
      const riskAnalysis = await this.runRiskAnalysis(context)

      // 提案生成の実行
      const recommendations = await this.runRecommendationAnalysis(context)

      // 結果の統合と検証
      return this.validateAndCombineResults(
        progressAnalysis,
        riskAnalysis,
        recommendations,
        request,
      )
    }
    catch (error) {
      console.error("進捗分析でエラーが発生:", error)
      throw new Error("進捗分析に失敗しました")
    }
  }

  // 進捗分析の実行
  private async runProgressAnalysis(context: PromptContext): Promise<any> {
    const prompt = generateProgressAnalysisPrompt(context)
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error("進捗分析の結果が空です")
    }

    return parseJsonResponse(result)
  }

  // リスク分析の実行
  private async runRiskAnalysis(context: PromptContext): Promise<any> {
    const prompt = generateRiskAnalysisPrompt(context)
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error("リスク分析の結果が空です")
    }

    return parseJsonResponse(result)
  }

  // 提案生成の実行
  private async runRecommendationAnalysis(context: PromptContext): Promise<any> {
    const prompt = generateRecommendationPrompt(context)
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error("提案生成の結果が空です")
    }

    return parseJsonResponse(result)
  }

  // 結果の検証と統合
  private validateAndCombineResults(
    progressAnalysis: any,
    riskAnalysis: any,
    recommendations: any,
    request: AnalysisRequest,
  ): AnalysisResult {
    // 進捗率の正規化
    const overallProgress = normalizeProgress(progressAnalysis.summary.overallProgress)

    // 完了日の検証
    if (!isValidDate(progressAnalysis.summary.estimatedCompletion)) {
      throw new Error("無効な完了予定日です")
    }

    // 信頼度スコアの計算
    const confidence = calculateConfidenceScore(
      request.tasks,
      request.risks,
      request.alerts,
    )

    return {
      summary: {
        overallProgress,
        estimatedCompletion: progressAnalysis.summary.estimatedCompletion,
        riskLevel: progressAnalysis.summary.riskLevel,
        confidence,
      },
      insights: {
        strengths: progressAnalysis.insights.strengths,
        weaknesses: progressAnalysis.insights.weaknesses,
        bottlenecks: progressAnalysis.insights.bottlenecks,
      },
      recommendations: {
        immediate: recommendations.recommendations.processImprovements
          .map((imp: any) => imp.suggestion)
          .slice(0, 3),
        shortTerm: recommendations.recommendations.resourceOptimization
          .map((opt: any) => opt.optimization)
          .slice(0, 3),
        longTerm: recommendations.recommendations.qualityEnhancements
          .map((enh: any) => enh.improvement)
          .slice(0, 3),
      },
      risks: {
        current: riskAnalysis.riskAnalysis.criticalRisks
          .map((risk: any) => risk.description)
          .slice(0, 3),
        potential: riskAnalysis.riskAnalysis.potentialRisks
          .map((risk: any) => risk.description)
          .slice(0, 3),
        mitigation: riskAnalysis.riskAnalysis.criticalRisks
          .flatMap((risk: any) => risk.mitigation)
          .slice(0, 3),
      },
    }
  }
}
