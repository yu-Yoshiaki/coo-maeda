"use client"

import type { ChatMessage } from "@/lib/llm/types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { generateBusinessPlan, sendChatMessage } from "../api/businessPlanApi"

interface Props {
  initialMessage?: string
}

export default function BusinessPlanAIAnalyzer({ initialMessage = "" }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState(initialMessage)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreatePlan = async () => {
    if (messages.length === 0) {
      toast({
        title: "エラー",
        description: "事業計画を作成するには、まず内容について説明してください。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await generateBusinessPlan(
        messages.map(({ role, content }) => ({
          role,
          content,
        })),
      )

      toast({
        title: "成功",
        description: "事業計画を作成しました。",
      })

      // 作成された事業計画の詳細ページに遷移
      router.push(`/business-plans/${response.id}`)
    }
    catch (error) {
      console.error("Error creating plan:", error)
      toast({
        title: "エラー",
        description: "事業計画の作成に失敗しました。",
        variant: "destructive",
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading)
      return

    setIsLoading(true)
    try {
      const userMessage: ChatMessage = {
        role: "user",
        content: input,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, userMessage])
      setInput("")

      const response = await sendChatMessage(
        [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
      )

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
    }
    catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました。",
        variant: "destructive",
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button
            onClick={handleCreatePlan}
            disabled={isLoading || messages.length === 0}
            variant="outline"
            className="whitespace-nowrap"
          >
            事業計画作成
          </Button>
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 rounded border p-2"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              送信
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
