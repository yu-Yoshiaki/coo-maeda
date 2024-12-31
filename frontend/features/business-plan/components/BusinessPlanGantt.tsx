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

export function BusinessPlanGantt({
  startDate,
  endDate,
  actionItems,
  milestones,
}: BusinessPlanGanttProps) {
  const data = useMemo(() => {
    const columns = [
      { type: "string", label: "Task ID" },
      { type: "string", label: "Task Name" },
      { type: "string", label: "Resource" },
      { type: "date", label: "Start Date" },
      { type: "date", label: "End Date" },
      { type: "number", label: "Duration" },
      { type: "number", label: "Percent Complete" },
      { type: "string", label: "Dependencies" },
    ]

    const rows = [
      // プロジェクト期間
      [
        "Project",
        "事業計画期間",
        "project",
        new Date(startDate),
        new Date(endDate),
        null,
        100,
        null,
      ],
      // アクションアイテム
      ...actionItems.map((item, index) => {
        const prevItemId = index > 0 ? `action-${index - 1}` : "Project"
        return [
          `action-${index}`,
          item.title,
          item.resources?.join(", ") || "リソース未定",
          new Date(item.startDate),
          new Date(item.dueDate),
          null,
          item.status === "completed" ? 100 : item.status === "in_progress" ? 50 : 0,
          prevItemId, // 前のアクションアイテムに依存
        ]
      }),
      // マイルストーン
      ...milestones.map((milestone, index) => {
        const relatedActions = actionItems
          .filter(item => item.milestoneId === milestone.id)
          .map((_, i) => `action-${i}`)
          .join(",")

        return [
          `milestone-${index}`,
          `🏁 ${milestone.title}`,
          "マイルストーン",
          new Date(milestone.dueDate),
          new Date(milestone.dueDate),
          null,
          milestone.status === "completed" ? 100 : 0,
          relatedActions || "Project", // 関連するアクションアイテムに依存
        ]
      }),
    ]

    return [columns, ...rows]
  }, [startDate, endDate, actionItems, milestones])

  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
      criticalPathEnabled: true,
      arrow: {
        angle: 100,
        width: 2,
        color: "#9E9E9E",
        radius: 0,
      },
      palette: [
        {
          color: "#4CAF50",
          dark: "#388E3C",
          light: "#81C784",
        },
        {
          color: "#2196F3",
          dark: "#1976D2",
          light: "#64B5F6",
        },
        {
          color: "#FFC107",
          dark: "#FFA000",
          light: "#FFD54F",
        },
      ],
    },
  }

  return (
    <div className="w-full overflow-x-auto">
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
