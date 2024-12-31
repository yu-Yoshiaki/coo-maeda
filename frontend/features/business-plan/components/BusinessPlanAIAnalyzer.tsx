"use client"

import type { BusinessPlanInput } from "../types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { mutate } from "swr"
import { businessPlanApi } from "../api/businessPlanApi"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function BusinessPlanAIAnalyzer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [context, setContext] = useState<string[]>([])

  const handleContinueChat = async () => {
    if (!input.trim())
      return
    setIsAnalyzing(true)

    try {
      // ユーザーメッセージを追加
      const userMessage: Message = { role: "user" as const, content: input }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput("")

      // AIからの応答を取得
      const response = await fetch("/api/business-plans/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error("チャットに失敗しました")
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant" as const,
        content: data.message,
      }
      setMessages([...newMessages, assistantMessage])
      setContext([...context, data.context])
    }
    catch (error) {
      console.error("Failed to chat:", error)
    }
    finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreatePlan = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/business-plans/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context }),
      })

      if (!response.ok) {
        throw new Error("分析に失敗しました")
      }

      const analyzedPlan: BusinessPlanInput = await response.json()
      await businessPlanApi.create(analyzedPlan)
      mutate("business-plans")

      // チャット履歴をクリア
      setMessages([])
      setContext([])
      setInput("")
    }
    catch (error) {
      console.error("Failed to analyze business plan:", error)
    }
    finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">事業計画の作成</h2>

      <ScrollArea className="mb-4 h-[400px] pr-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </ScrollArea>

      <div className="space-y-4">
        <div>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={4}
            className="w-full"
            placeholder="事業計画について教えてください。例: AIを活用した営業支援システムを開発したいと考えています。"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleContinueChat}
            disabled={isAnalyzing || !input.trim()}
            variant="secondary"
          >
            {isAnalyzing ? "応答中..." : "計画を立てる"}
          </Button>
          <Button
            onClick={handleCreatePlan}
            disabled={isAnalyzing || messages.length === 0}
          >
            事業計画書を作成する
          </Button>
        </div>
      </div>
    </Card>
  )
}
