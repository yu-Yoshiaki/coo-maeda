"use client"

import type { BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/Loading"
import { BusinessPlanGanttSection } from "@/features/business-plan/components/BusinessPlanGanttSection"
import { BusinessPlanInlineEdit } from "@/features/business-plan/components/BusinessPlanInlineEdit"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Check, CheckCircle2, Circle, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

const STATUS_OPTIONS = [
  { value: "todo", label: "未着手", icon: Circle, color: "text-gray-500", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  { value: "in_progress", label: "進行中", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { value: "completed", label: "完了", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
]

export default function BusinessPlanDetailPage({
  params,
}: {
  params: { planId: string }
}) {
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null)
  const [changes, setChanges] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  // 初期データの取得
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: plan, error } = await supabase
        .from("business_plans")
        .select(`
          *,
          action_items!inner (
            id,
            status
          )
        `)
        .eq("id", params.planId)
        .single()

      if (error || !plan) {
        notFound()
      }

      setBusinessPlan(plan as BusinessPlan)
    }

    fetchData()
  }, [params.planId])

  if (!businessPlan) {
    return <Loading />
  }

  // アクションアイテムのステータスごとの数を計算
  const actionItemCounts = {
    todo: businessPlan.action_items?.filter(item => item.status === "todo").length ?? 0,
    in_progress: businessPlan.action_items?.filter(item => item.status === "in_progress").length ?? 0,
    completed: businessPlan.action_items?.filter(item => item.status === "completed").length ?? 0,
  }

  // フィールドの変更を記録
  const handleFieldChange = (field: string, value: string) => {
    setChanges(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // 変更を保存
  const handleSave = async () => {
    if (Object.keys(changes).length === 0)
      return

    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from("business_plans")
        .update(changes)
        .eq("id", businessPlan.id)

      if (error)
        throw error

      // 成功したら変更をクリアして状態を更新
      setChanges({})
      setBusinessPlan(prev => ({
        ...prev!,
        ...changes,
      }))
    }
    catch (error) {
      console.error("Error updating business plan:", error)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">
          <BusinessPlanInlineEdit
            id={businessPlan.id}
            field="title"
            value={businessPlan.title}
            className="text-3xl font-bold"
            onChange={handleFieldChange}
          />
        </h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleSave}
            disabled={loading || Object.keys(changes).length === 0}
          >
            <Check className="mr-2 size-4" />
            保存する
          </Button>
          <Button asChild>
            <Link href={`/business-plans/${businessPlan.id}/action-items`}>
              アクションアイテム一覧
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 概要 */}
        <Card>
          <CardHeader>
            <CardTitle>概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="mb-2 font-semibold">説明</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="description"
                  value={businessPlan.description || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                  className="h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-semibold">期間</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">開始日</label>
                      <BusinessPlanInlineEdit
                        id={businessPlan.id}
                        field="startDate"
                        value={businessPlan.startDate || ""}
                        type="date"
                        onChange={handleFieldChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">終了日</label>
                      <BusinessPlanInlineEdit
                        id={businessPlan.id}
                        field="endDate"
                        value={businessPlan.endDate || ""}
                        type="date"
                        onChange={handleFieldChange}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">ステータス</h3>
                  <BusinessPlanInlineEdit
                    id={businessPlan.id}
                    field="status"
                    value={businessPlan.status || "draft"}
                    type="select"
                    selectOptions={STATUS_OPTIONS}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5W1H */}
        <Card>
          <CardHeader>
            <CardTitle>5W1H</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-2 font-semibold">What（何を）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.what"
                  value={businessPlan.context?.what || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">When（いつ）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.when"
                  value={businessPlan.context?.when || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Where（どこで）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.where"
                  value={businessPlan.context?.where || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Who（誰が）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.who"
                  value={businessPlan.context?.who || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Why（なぜ）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.why"
                  value={businessPlan.context?.why || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">How（どのように）</h3>
                <BusinessPlanInlineEdit
                  id={businessPlan.id}
                  field="context.how"
                  value={businessPlan.context?.how || ""}
                  type="textarea"
                  onChange={handleFieldChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ガントチャート */}
        <BusinessPlanGanttSection businessPlan={businessPlan} />

        {/* アクションアイテム概要 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>アクションアイテム概要</CardTitle>
              <Button variant="outline" asChild>
                <Link href={`/business-plans/${businessPlan.id}/action-items`}>
                  詳細を見る
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {STATUS_OPTIONS.map(({ value, label, icon: Icon, color, bgColor, borderColor }) => {
                const count = actionItemCounts[value as keyof typeof actionItemCounts]
                return (
                  <Link
                    key={value}
                    href={`/business-plans/${businessPlan.id}/action-items?status=${value}`}
                  >
                    <Card
                      className={cn(
                        "border transition-colors hover:shadow-md cursor-pointer",
                        borderColor,
                        {
                          "opacity-50": count === 0,
                        },
                      )}
                    >
                      <CardContent className={cn("flex items-center gap-4 p-6", bgColor)}>
                        <Icon className={cn("size-8", color)} />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {count}
                          </p>
                          <p className="text-sm text-gray-600">{label}</p>
                          {count > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              クリックして
                              {label}
                              のアイテムを表示
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
