import { createOpenAIClient } from "../config"

/**
 * 事業計画分析用のプロンプトを生成
 */
export function generateBusinessPlanPrompt(
  plan: string,
  type: "analyze" | "improve" | "risk",
): string {
  const basePrompt = `以下の事業計画について${type === "analyze" ? "分析" : type === "improve" ? "改善点" : "リスク"}を詳しく説明してください：\n\n${plan}`

  switch (type) {
    case "analyze":
      return `${basePrompt}\n\n以下の観点から分析してください：\n- 市場性\n- 実現可能性\n- 収益性\n- 競合優位性`
    case "improve":
      return `${basePrompt}\n\n以下の観点から改善点を提案してください：\n- 戦略\n- 運営\n- マーケティング\n- 財務`
    case "risk":
      return `${basePrompt}\n\n以下の観点からリスクを分析してください：\n- 市場リスク\n- 運営リスク\n- 財務リスク\n- 法的リスク`
  }
}
