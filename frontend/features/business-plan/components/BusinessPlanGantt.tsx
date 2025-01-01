"use client"

import type { ActionItem, Milestone } from "../types/BusinessPlan"
import { useMemo } from "react"
import { Chart } from "react-google-charts"

interface BusinessPlanGanttProps {
  startDate: string
  endDate: string
  actionItems: ActionItem[]
  milestones: Milestone[]
}

// ステータスに応じた色を返す関数
function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "#4CAF50" // 緑
    case "in_progress":
      return "#2196F3" // 青
    default:
      return "#FFC107" // 黄
  }
}

export function BusinessPlanGantt({
  startDate,
  endDate,
  actionItems,
  milestones,
}: BusinessPlanGanttProps) {
  const data = useMemo(() => {
    const columns = [
      { type: "string", label: "タスクID" },
      { type: "string", label: "タスク名" },
      { type: "string", label: "担当者" },
      { type: "date", label: "開始日" },
      { type: "date", label: "終了日" },
      { type: "number", label: "期間" },
      { type: "number", label: "進捗率" },
      { type: "string", label: "依存関係" },
    ]

    const rows = [
      // プロジェクト期間
      [
        "Project",
        "事業計画期間",
        "全体",
        new Date(startDate),
        new Date(endDate),
        null,
        100,
        null,
      ],
      // アクションアイテム
      ...actionItems.map((item, index) => {
        const prevItemId = index > 0 ? `action-${index - 1}` : "Project"
        const statusText = item.status === "completed" ? "完了" : item.status === "in_progress" ? "進行中" : "未着手"
        return [
          `action-${index}`,
          `${item.title} (${statusText})`,
          item.resources?.join(", ") || "未定",
          new Date(item.start_date),
          new Date(item.due_date),
          null,
          item.status === "completed" ? 100 : item.status === "in_progress" ? 50 : 0,
          prevItemId,
        ]
      }),
      // マイルストーン
      ...milestones.map((milestone, index) => {
        const relatedActions = actionItems
          .filter(item => item.milestone_id === milestone.id)
          .map((_, i) => `action-${i}`)
          .join(",")

        const statusText = milestone.status === "completed" ? "完了" : "未完了"
        return [
          `milestone-${index}`,
          `🏁 ${milestone.title} (${statusText})`,
          "マイルストーン",
          new Date(milestone.due_date),
          new Date(milestone.due_date),
          null,
          milestone.status === "completed" ? 100 : 0,
          relatedActions || "Project",
        ]
      }),
    ]

    return [columns, ...rows]
  }, [startDate, endDate, actionItems, milestones])

  const options = {
    height: 400,
    language: "ja", // 日本語表示
    gantt: {
      trackHeight: 40, // 行の高さを増やす
      barHeight: 20, // バーの高さ
      labelStyle: {
        fontName: "sans-serif",
        fontSize: 13,
      },
      innerGridHorizLine: {
        stroke: "#e0e0e0",
      },
      innerGridTrack: {
        fill: "#f5f5f5",
      },
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: "#e53935",
        strokeWidth: 2,
      },
      arrow: {
        angle: 100,
        width: 2,
        color: "#9E9E9E",
        radius: 0,
      },
      defaultStartDate: new Date(startDate),
      palette: [
        {
          // プロジェクト期間
          color: "#78909C",
          dark: "#546E7A",
          light: "#90A4AE",
        },
        {
          // 完了タスク
          color: "#4CAF50",
          dark: "#388E3C",
          light: "#81C784",
        },
        {
          // 進行中タスク
          color: "#2196F3",
          dark: "#1976D2",
          light: "#64B5F6",
        },
        {
          // 未着手タスク
          color: "#FFC107",
          dark: "#FFA000",
          light: "#FFD54F",
        },
      ],
    },
    tooltip: { isHtml: true }, // HTMLツールチップを有効化
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Chart
        chartType="Gantt"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
    </div>
  )
}
