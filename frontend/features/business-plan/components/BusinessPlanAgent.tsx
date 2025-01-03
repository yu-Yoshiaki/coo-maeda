"use client"

import type { BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

export function BusinessPlanAgent({ plan }: { plan: BusinessPlan }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 初期メッセージを設定
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `こんにちは！私は「${plan.title}」専属のAIアシスタントです。プロジェクトの進行状況や課題について、お気軽にご相談ください。`,
        timestamp: new Date(),
      },
    ])
  }, [plan.title])

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim())
        return

      // ユーザーメッセージを追加
      const userMessage: Message = {
        role: "user",
        content,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        const response = await fetch("/api/business-plans/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: plan.id,
            message: content,
            context: {
              title: plan.title,
              description: plan.description,
              status: plan.status,
              context: plan.context,
              actionItems: plan.action_items,
              milestones: plan.milestones,
            },
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        const data = await response.json()

        // AIの応答を追加
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
      catch (error) {
        console.error("Error:", error)
        // エラーメッセージを表示
        const errorMessage: Message = {
          role: "assistant",
          content: "申し訳ありません。エラーが発生しました。",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
      finally {
        setIsLoading(false)
      }
    },
    [plan],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>AIアシスタント</span>
          {isLoading && (
            <span className="size-2 animate-pulse rounded-full bg-blue-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* メッセージ表示エリア */}
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[400px] rounded-md border p-4"
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "assistant"
                        ? "bg-gray-100"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* 入力エリア */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
