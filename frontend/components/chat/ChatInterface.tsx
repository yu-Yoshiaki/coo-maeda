"use client"

import type { FC } from "react"
import { Paperclip, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

export const ChatInterface: FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim())
      return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // TODO: AI応答の実装
    // ここでAIの応答を待ち、応答が来たら新しいメッセージとして追加
  }

  return (
    <div className="flex h-full flex-col">
      {/* チャット��歴 */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p>{message.content}</p>
              <time className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="ファイルを添付"
          >
            <Paperclip className="size-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="メッセージを入力"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={!inputValue.trim()}
          >
            <Send className="size-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
