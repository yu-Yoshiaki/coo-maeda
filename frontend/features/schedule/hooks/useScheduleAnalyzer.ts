import { useState } from "react"

interface AnalyzeOptions {
  startDate: string
  endDate: string
  includePatternAnalysis?: boolean
  includeTimeDistribution?: boolean
}

interface AnalysisResult {
  summary: {
    totalEvents: number
    busyDays: string[]
    quietDays: string[]
    averageEventsPerDay: number
  }
  timeDistribution?: {
    morningEvents: number
    afternoonEvents: number
    eveningEvents: number
    overlappingEvents: {
      date: string
      events: string[]
    }[]
  }
  patterns?: {
    regularEvents: {
      title: string
      frequency: string
      suggestedOptimization: string
    }[]
    timePreferences: {
      preferredDays: string[]
      preferredTimes: string[]
    }
  }
  recommendations: {
    scheduling: string[]
    optimization: string[]
    workLifeBalance: string[]
  }
}

export function useScheduleAnalyzer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const analyzeSchedule = async (options: AnalyzeOptions) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/schedules/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "スケジュールの分析に失敗しました")
      }

      const data = await response.json()
      setResult(data.data)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました")
      setResult(null)
    }
    finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    result,
    analyzeSchedule,
  }
}
