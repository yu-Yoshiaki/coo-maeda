"use client"

import type { ActionItem } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loading } from "@/components/ui/Loading"
import { ActionItemCreateDialog } from "@/features/business-plan/components/ActionItemCreateDialog"
import { ActionItemInlineEdit } from "@/features/business-plan/components/ActionItemInlineEdit"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Check, CheckCircle2, Circle, Clock } from "lucide-react"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"

const STATUS_OPTIONS = [
  { value: "todo", label: "未着手", icon: Circle, color: "text-gray-500" },
  { value: "in_progress", label: "進行中", icon: Clock, color: "text-blue-500" },
  { value: "completed", label: "完了", icon: CheckCircle2, color: "text-green-500" },
]

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0]
}

export default function ActionItemsPage({
  params,
}: {
  params: { planId: string }
}) {
  const [actionItems, setActionItems] = useState<ActionItem[] | null>(null)
  const [changes, setChanges] = useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // URLからステータスパラメータを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get("status")
    if (status) {
      setSelectedStatus(status)
    }
  }, [])

  // データ取得関数
  const fetchData = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching action items:", error)
      return
    }

    setActionItems(data as ActionItem[])
  }

  // 初期データの取得
  useEffect(() => {
    fetchData()
  }, [params.planId])

  if (!actionItems) {
    return <Loading />
  }

  // フィルタリングされたアイテムを取得
  const filteredItems = selectedStatus
    ? actionItems.filter(item => item.status === selectedStatus)
    : actionItems

  // ステータスごとのアイテム数を計算
  const statusCounts = actionItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // フィールドの変更を記録
  const handleFieldChange = (id: string, field: string, value: string) => {
    setChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  // 変更を保存
  const handleSave = async () => {
    if (Object.keys(changes).length === 0)
      return

    try {
      setLoading(true)
      const supabase = createClient()

      // 各アクションアイテムの変更を保存
      for (const [id, fields] of Object.entries(changes)) {
        const { error } = await supabase
          .from("action_items")
          .update(fields)
          .eq("id", id)

        if (error)
          throw error
      }

      // 成功したら変更をクリアして状態を更新
      setChanges({})
      setActionItems((prev) => {
        if (!prev)
          return null
        return prev.map(item => ({
          ...item,
          ...changes[item.id],
        }))
      })
    }
    catch (error) {
      console.error("Error updating action items:", error)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">アクションアイテム一覧</h1>
          <ActionItemCreateDialog
            businessPlanId={params.planId}
            onCreated={() => {
              // データを再取得
              fetchData()
            }}
          />
        </div>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
              <Button
                key={value}
                variant="ghost"
                className={cn(
                  "flex items-center gap-2",
                  selectedStatus === value ? color : "text-gray-500",
                )}
                onClick={() => setSelectedStatus(selectedStatus === value ? null : value)}
              >
                <Icon className="size-4" />
                <span className="text-sm">
                  {label}
                  {" "}
                  (
                  {statusCounts[value] || 0}
                  )
                </span>
              </Button>
            ))}
          </div>
          <Button
            onClick={handleSave}
            disabled={loading || Object.keys(changes).length === 0}
            size="lg"
          >
            <Check className="mr-2 size-4" />
            保存する
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => {
          const { icon: StatusIcon, color } = getStatusInfo(item.status)
          return (
            <Card
              key={item.id}
              className={cn("p-4 transition-colors", {
                "border-gray-200": item.status === "todo",
                "border-blue-200": item.status === "in_progress",
                "border-green-200": item.status === "completed",
              })}
            >
              <div className="grid gap-4">
                <div className="grid grid-cols-[auto,1fr,auto] gap-4">
                  <StatusIcon className={cn("mt-1 size-5", color)} />
                  <div>
                    <h3 className="mb-2 font-semibold">タイトル</h3>
                    <ActionItemInlineEdit
                      id={item.id}
                      field="title"
                      value={item.title}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="w-48">
                    <h3 className="mb-2 font-semibold">ステータス</h3>
                    <ActionItemInlineEdit
                      id={item.id}
                      field="status"
                      value={item.status}
                      type="select"
                      selectOptions={STATUS_OPTIONS}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">説明</h3>
                  <ActionItemInlineEdit
                    id={item.id}
                    field="description"
                    value={item.description || ""}
                    type="textarea"
                    className="h-24"
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="mb-2 font-semibold">開始日</h3>
                    <ActionItemInlineEdit
                      id={item.id}
                      field="start_date"
                      value={item.start_date || ""}
                      type="date"
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">期限日</h3>
                    <ActionItemInlineEdit
                      id={item.id}
                      field="due_date"
                      value={item.due_date || ""}
                      type="date"
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
