"use client"

import type { Message } from "../../types"
import { useEffect, useState } from "react"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // クライアントサイドでのみ初期メッセージを設定
    setMessages([
      {
        id: performance.now().toString(),
        role: "assistant",
        content: "こんにちは、COO前田です。どのようなお手伝いができますか？",
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: performance.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])

    // AIの応答をシミュレート
    setTimeout(() => {
      const aiResponse: Message = {
        id: performance.now().toString(),
        role: "assistant",
        content: "申し訳ありません。現在はデモ版のため、固定の応答のみ返信可能です。",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  if (messages.length === 0) {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>
      <div className="border-t p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
