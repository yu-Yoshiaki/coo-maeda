"use client"

import type { Schedule } from "@/lib/validations/schedule"
import { useState } from "react"

interface NaturalLanguageInputProps {
  onSubmit: (schedule: Schedule) => Promise<void>
  isLoading?: boolean
}

export function NaturalLanguageInput({
  onSubmit,
  isLoading = false,
}: NaturalLanguageInputProps) {
  const [text, setText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/schedules/natural-language", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "スケジュールの解析に失敗しました")
      }

      const schedule = await response.json()
      await onSubmit(schedule)
      setText("")
    }
    catch (error) {
      console.error("Error processing natural language input:", error)
      // eslint-disable-next-line no-alert
      alert(error instanceof Error ? error.message : "スケジュールの解析に失敗しました")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="text" className="block text-sm font-medium">
          予定を自然な言葉で入力
        </label>
        <textarea
          id="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="例: 明日の14時から1時間、会議室Aでミーティング"
          className="mt-1 block w-full rounded-md border p-2"
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "解析中..." : "解析"}
        </button>
      </div>
    </form>
  )
}
