import type { ChatHistory, ChatMessage } from "../types"
import { createOpenAIClient, handleOpenAIError } from "../config"

/**
 * メッセージを送信して応答を取得
 */
export async function sendMessage(
  message: string,
  history: ChatMessage[] = [],
): Promise<{ content: string, history: ChatMessage[] }> {
  try {
    const api = createOpenAIClient()
    const newMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...history, newMessage]
    const response = await api.chat.completions.create({
      messages: updatedHistory.map(({ role, content }) => ({ role, content })),
      model: "gpt-4o-mini",
      temperature: 1,
      max_tokens: 1000,
    })

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: response.choices[0]?.message?.content || "",
      timestamp: new Date().toISOString(),
    }

    return {
      content: assistantMessage.content,
      history: [...updatedHistory, assistantMessage],
    }
  }
  catch (error) {
    throw handleOpenAIError(error)
  }
}

/**
 * メッセージをストリーミング送信して応答を取得
 */
export async function sendMessageStream(
  message: string,
  history: ChatMessage[] = [],
  onUpdate: (content: string) => void,
): Promise<{ content: string, history: ChatMessage[] }> {
  try {
    const api = createOpenAIClient()
    const newMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...history, newMessage]
    const stream = await api.chat.completions.create({
      messages: updatedHistory.map(({ role, content }) => ({ role, content })),
      model: "gpt-4o-mini",
      temperature: 1,
      max_tokens: 1000,
      stream: true,
    })

    let fullContent = ""
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ""
      fullContent += content
      onUpdate(fullContent)
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: fullContent,
      timestamp: new Date().toISOString(),
    }

    return {
      content: fullContent,
      history: [...updatedHistory, assistantMessage],
    }
  }
  catch (error) {
    throw handleOpenAIError(error)
  }
}
