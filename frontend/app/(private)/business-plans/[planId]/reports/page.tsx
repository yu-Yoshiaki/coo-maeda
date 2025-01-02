"use client"

import type { ActionItem, BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { Card } from "@/components/ui/card"
import { Loading } from "@/components/ui/Loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottleneckAnalysis } from "@/features/business-plan/components/BottleneckAnalysis"
import { PlanVsActual } from "@/features/business-plan/components/PlanVsActual"
import { ProgressChart } from "@/features/business-plan/components/ProgressChart"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function ReportsPage({
  params,
}: {
  params: { planId: string }
}) {
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // ビジネスプランの取得
      const { data: plan, error: planError } = await supabase
        .from("business_plans")
        .select("*")
        .eq("id", params.planId)
        .single()

      if (planError) {
        console.error("Error fetching business plan:", planError)
        return
      }

      // アクションアイテムの取得
      const { data: items, error: itemsError } = await supabase
        .from("action_items")
        .select(`
          id,
          title,
          description,
          status,
          start_date,
          due_date,
          business_plan_id,
          created_at,
          updated_at
        `)
        .eq("business_plan_id", params.planId)
        .order("created_at", { ascending: true })

      if (itemsError) {
        console.error("Error fetching action items:", itemsError)
        return
      }

      console.log("Fetched business plan:", plan)
      console.log("Fetched action items:", items)

      setBusinessPlan(plan)
      setActionItems(items)
      setLoading(false)
    }

    fetchData()
  }, [params.planId])

  if (loading || !actionItems || !businessPlan) {
    return <Loading />
  }

  if (actionItems.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">進捗レポート</h1>
        <Card className="p-6">
          <p className="text-center text-gray-500">
            アクションアイテムが登録されていません。
            <br />
            アクションアイテムを追加すると、進捗状況がここに表示されます。
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">進捗レポート</h1>
        <p className="text-gray-500">
          期間:
          {" "}
          {businessPlan.start_date ? new Date(businessPlan.start_date).toLocaleDateString() : "未設定"}
          ～
          {" "}
          {businessPlan.end_date ? new Date(businessPlan.end_date).toLocaleDateString() : "未設定"}
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">週次レポート</TabsTrigger>
          <TabsTrigger value="monthly">月次レポート</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-8">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">完了率の推移</h2>
            <ProgressChart
              data={actionItems}
              period="weekly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">ボトルネック分析</h2>
            <BottleneckAnalysis
              data={actionItems}
              period="weekly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">予定と実績の比較</h2>
            <PlanVsActual
              data={actionItems}
              period="weekly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-8">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">完了率の推移</h2>
            <ProgressChart
              data={actionItems}
              period="monthly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">ボトルネック分析</h2>
            <BottleneckAnalysis
              data={actionItems}
              period="monthly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">予定と実績の比較</h2>
            <PlanVsActual
              data={actionItems}
              period="monthly"
              startDate={businessPlan.start_date ? new Date(businessPlan.start_date) : undefined}
              endDate={businessPlan.end_date ? new Date(businessPlan.end_date) : undefined}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
