import type { Schedule } from "@/lib/validations/schedule"

export function useScheduleAnalyzer() {
  const analyzeSchedule = async (text: string): Promise<Schedule> => {
    const response = await fetch("/api/schedule/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("予定の解析に失敗しました")
    }

    return response.json()
  }

  return { analyzeSchedule }
}
