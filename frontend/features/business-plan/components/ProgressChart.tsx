"use client"

import type { ActionItem } from "@/features/business-plan/types/BusinessPlan"
import { eachMonthOfInterval, eachWeekOfInterval, format, isWithinInterval, startOfMonth, startOfWeek } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ProgressChartProps {
  data: ActionItem[]
  period: "weekly" | "monthly"
  startDate?: Date
  endDate?: Date
}

export function ProgressChart({ data, period, startDate, endDate }: ProgressChartProps) {
  // データが空の場合は空のグラフを表示
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-gray-500">データがありません</p>
      </div>
    )
  }

  // 期限日が設定されているアイテムのみを対象とする
  const validItems = data.filter(item => item.due_date)
  if (validItems.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-gray-500">期限日が設定されているアイテムがありません</p>
      </div>
    )
  }

  // 期間の開始日と終了日を取得（ビジネスプランの期間がある場合はそれを使用）
  const dates = validItems.map(item => new Date(item.due_date!))
  const chartStartDate = startDate || new Date(Math.min(...dates.map(d => d.getTime())))
  const chartEndDate = endDate || new Date(Math.max(...dates.map(d => d.getTime())))

  // 期間ごとのデータポイントを生成
  const timePoints = period === "weekly"
    ? eachWeekOfInterval({ start: chartStartDate, end: chartEndDate })
    : eachMonthOfInterval({ start: chartStartDate, end: chartEndDate })

  // 各期間の完了率を計算
  const chartData = timePoints.map((date) => {
    const periodStart = period === "weekly"
      ? startOfWeek(date, { locale: ja })
      : startOfMonth(date)
    const periodEnd = period === "weekly"
      ? new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)

    // 期間内に期限日があるアイテムをフィルタリング
    const periodItems = validItems.filter(item =>
      isWithinInterval(new Date(item.due_date!), {
        start: periodStart,
        end: periodEnd,
      }),
    )

    // 完了率を計算
    const totalItems = periodItems.length
    const completedItems = periodItems.filter(item => item.status === "completed").length
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    return {
      date: format(date, period === "weekly" ? "MM/dd" : "yyyy/MM", { locale: ja }),
      完了率: Math.round(completionRate),
      総タスク数: totalItems,
      完了タスク数: completedItems,
    }
  })

  // データがある期間のみを表示
  const filteredChartData = chartData.filter(data => data.総タスク数 > 0)

  return (
    <div className="relative min-h-[400px] w-full" style={{ height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={400}>
        <LineChart
          data={filteredChartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "完了率")
                return [`${value}%`, name]
              return [value, name]
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="完了率"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
