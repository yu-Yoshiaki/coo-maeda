"use client"

import type { BusinessPlan } from "../types/BusinessPlan"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessPlanGantt } from "./BusinessPlanGantt"

export function BusinessPlanGanttSection({ businessPlan }: { businessPlan: BusinessPlan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>進捗状況</CardTitle>
      </CardHeader>
      <CardContent>
        {businessPlan.start_date && businessPlan.end_date
          ? (
              <BusinessPlanGantt
                startDate={businessPlan.start_date}
                endDate={businessPlan.end_date}
                actionItems={businessPlan.actionItems || []}
                milestones={businessPlan.milestones || []}
              />
            )
          : (
              <p className="text-center text-gray-500">期間が設定されていないためガントチャートを表示できません</p>
            )}
      </CardContent>
    </Card>
  )
}
