"use client"

import type { ActionItem, ActionItemStatus } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/Loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function ActionItemsPage() {
  const params = useParams()
  const router = useRouter()
  const [items, setItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null)

  const fetchItems = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("action_items")
      .select("*")
      .eq("business_plan_id", params.planId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching action items:", error)
      return
    }

    setItems(data || [])
    setLoading(false)
  }, [params.planId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const updateItem = async (item: ActionItem) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("action_items")
      .update({
        title: item.title,
        description: item.description,
        status: item.status,
        resources: item.resources,
        startDate: item.startDate,
        dueDate: item.dueDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    if (error) {
      console.error("Error updating action item:", error)
      return
    }

    setEditingItem(null)
    fetchItems()
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">アクションアイテム一覧</h1>
        <Button onClick={() => router.back()}>戻る</Button>
      </div>

      <div className="grid gap-4">
        {items.map(item => (
          <Card key={item.id} className="p-4">
            {editingItem?.id === item.id
              ? (
                  <div className="space-y-4">
                    <Input
                      value={editingItem.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="タイトル"
                    />
                    <Textarea
                      value={editingItem.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="説明"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        value={editingItem.startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingItem({ ...editingItem, startDate: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={editingItem.dueDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingItem({ ...editingItem, dueDate: e.target.value })}
                      />
                    </div>
                    <Select
                      value={editingItem.status}
                      onValueChange={(value: ActionItemStatus) =>
                        setEditingItem({ ...editingItem, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">未着手</SelectItem>
                        <SelectItem value="in_progress">進行中</SelectItem>
                        <SelectItem value="completed">完了</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={editingItem.resources.join(", ")}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingItem({
                          ...editingItem,
                          resources: e.target.value.split(",").map(s => s.trim()),
                        })}
                      placeholder="リソース（カンマ区切り）"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingItem(null)}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={() => updateItem(editingItem)}>保存</Button>
                    </div>
                  </div>
                )
              : (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <Button
                        variant="outline"
                        onClick={() => setEditingItem(item)}
                      >
                        編集
                      </Button>
                    </div>
                    <p className="mb-2 text-gray-600">{item.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <p>
                          開始日:
                          {new Date(item.startDate).toLocaleDateString()}
                        </p>
                        <p>
                          期限:
                          {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p>
                          ステータス:
                          {item.status}
                        </p>
                        <p>
                          リソース:
                          {item.resources.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
          </Card>
        ))}
      </div>
    </div>
  )
}
