"use client"

import type { ActionItem } from "@/features/business-plan/types/BusinessPlan"
import { eachMonthOfInterval, eachWeekOfInterval, format, isWithinInterval, startOfMonth, startOfWeek } from "date-fns"
import { ja } from "date-fns/locale"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface BottleneckAnalysisProps {
  data: ActionItem[]
  period: "weekly" | "monthly"
  startDate?: Date
  endDate?: Date
}

export function BottleneckAnalysis({ data, period, startDate, endDate }: BottleneckAnalysisProps) {
  // データが空の場合は空のグラフを表示
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-gray-500">データがありません</p>
      </div>
    )
  }

  // 期間の開始日と終了日を取得（ビジネスプランの期間がある場合はそれを使用）
  const dates = data.map(item => new Date(item.created_at))
  const chartStartDate = startDate || new Date(Math.min(...dates.map(d => d.getTime())))
  const chartEndDate = endDate || new Date(Math.max(...dates.map(d => d.getTime())))

  // 期間ごとのデータポイントを生成
  const timePoints = period === "weekly"
    ? eachWeekOfInterval({ start: chartStartDate, end: chartEndDate })
    : eachMonthOfInterval({ start: chartStartDate, end: chartEndDate })

  // 各期間のステータス別アイテム数を計算
  const chartData = timePoints.map((date) => {
    const periodStart = period === "weekly"
      ? startOfWeek(date, { locale: ja })
      : startOfMonth(date)
    const periodEnd = period === "weekly"
      ? new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)

    // 期間内のアイテムをフィルタリング
    const periodItems = data.filter(item =>
      isWithinInterval(new Date(item.created_at), {
        start: periodStart,
        end: periodEnd,
      }),
    )

    // ステータス別のアイテム数を集計
    const todoCount = periodItems.filter(item => item.status === "todo").length
    const inProgressCount = periodItems.filter(item => item.status === "in_progress").length
    const completedCount = periodItems.filter(item => item.status === "completed").length

    return {
      date: format(date, period === "weekly" ? "MM/dd" : "yyyy/MM", { locale: ja }),
      未着手: todoCount,
      進行中: inProgressCount,
      完了: completedCount,
    }
  })

  // データがある期間のみを表示
  const filteredChartData = chartData.filter(data =>
    data.未着手 > 0 || data.進行中 > 0 || data.完了 > 0,
  )

  return (
    <div className="relative min-h-[400px] w-full" style={{ height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <BarChart
          data={filteredChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="未着手" stackId="a" fill="#fbbf24" />
          <Bar dataKey="進行中" stackId="a" fill="#60a5fa" />
          <Bar dataKey="完了" stackId="a" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
