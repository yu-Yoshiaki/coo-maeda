import type { BusinessPlanInput } from "../types/BusinessPlan"

/**
 * 事業計画を作成
 */
export async function createBusinessPlan(input: BusinessPlanInput) {
  const response = await fetch("/api/business-plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error("Failed to create business plan")
  }

  return response.json()
}

/**
 * チャットメッセージを送信
 */
export async function sendChatMessage(messages: { role: string, content: string }[]) {
  const response = await fetch("/api/business-plans/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error("Failed to send chat message")
  }

  return response.json()
}

/**
 * 事業計画を生成
 */
export async function generateBusinessPlan(messages: { role: string, content: string }[]) {
  const response = await fetch("/api/business-plans/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate business plan")
  }

  return response.json()
}
