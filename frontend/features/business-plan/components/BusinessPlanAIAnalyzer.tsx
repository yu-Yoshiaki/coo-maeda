"use client"

import type { BusinessPlanInput } from "../types/BusinessPlan"
import { useState } from "react"
import { mutate } from "swr"
import { businessPlanApi } from "../api/businessPlanApi"

export function BusinessPlanAIAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [description, setDescription] = useState("")

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/business-plans/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        throw new Error("分析に失敗しました")
      }

      const analyzedPlan: BusinessPlanInput = await response.json()
      await businessPlanApi.create(analyzedPlan)
      mutate("business-plans")
      setDescription("")
    }
    catch (error) {
      console.error("Failed to analyze business plan:", error)
    }
    finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">事業計画の説明</h2>
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            自然言語で事業計画を説明してください
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="例: 2024年第2四半期までにAI機能を活用した営業支援システムを開発し、売上を30%向上させる計画です。主なターゲットは中小企業で、開発チーム5名で実施します。"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? "分析中..." : "AIで分析"}
          </button>
        </div>
      </form>
    </div>
  )
}
