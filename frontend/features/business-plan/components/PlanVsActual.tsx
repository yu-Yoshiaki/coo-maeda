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

interface PlanVsActualProps {
  data: ActionItem[]
  period: "weekly" | "monthly"
  startDate?: Date
  endDate?: Date
}

export function PlanVsActual({ data, period, startDate, endDate }: PlanVsActualProps) {
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

  // 各期間の予定と実績を計算
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

    // 期限日が期間内のアイテム数（予定）
    const plannedItems = data.filter(item =>
      item.due_date && isWithinInterval(new Date(item.due_date), {
        start: periodStart,
        end: periodEnd,
      }),
    ).length

    // 実際に完了したアイテム数（実績）
    const completedItems = periodItems.filter(item => item.status === "completed").length

    // 遅延しているアイテム数
    const delayedItems = data.filter(item =>
      item.due_date
      && new Date(item.due_date) < new Date()
      && item.status !== "completed",
    ).length

    return {
      date: format(date, period === "weekly" ? "MM/dd" : "yyyy/MM", { locale: ja }),
      予定: plannedItems,
      実績: completedItems,
      遅延: delayedItems,
    }
  })

  // データがある期間のみを表示
  const filteredChartData = chartData.filter(data =>
    data.予定 > 0 || data.実績 > 0 || data.遅延 > 0,
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
          <Bar dataKey="予定" fill="#93c5fd" />
          <Bar dataKey="実績" fill="#34d399" />
          <Bar dataKey="遅延" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
