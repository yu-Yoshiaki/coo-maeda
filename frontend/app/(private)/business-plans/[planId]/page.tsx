import type { BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/Loading"
import { BusinessPlanGantt } from "@/features/business-plan/components/BusinessPlanGantt"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { notFound } from "next/navigation"

// 日付フォーマット用のヘルパー関数
function formatDate(dateString: string | null | undefined): string {
  if (!dateString)
    return "未設定"
  try {
    return new Date(dateString).toLocaleDateString()
  }
  catch (error) {
    console.error("Date formatting error:", error)
    return "無効な日付"
  }
}

export default async function BusinessPlanDetailPage({
  params,
}: {
  params: { planId: string }
}) {
  const supabase = await createClient()
  const { data: plan, error } = await supabase
    .from("business_plans")
    .select(`
      *,
      action_items (*),
      milestones (*)
    `)
    .eq("id", params.planId)
    .single()

  if (error || !plan) {
    notFound()
  }

  const businessPlan = plan as BusinessPlan

  // アクションアイテムのステータスごとの数を計算
  const actionItemCounts = {
    todo: businessPlan.actionItems?.filter(item => item.status === "todo").length ?? 0,
    in_progress: businessPlan.actionItems?.filter(item => item.status === "in_progress").length ?? 0,
    completed: businessPlan.actionItems?.filter(item => item.status === "completed").length ?? 0,
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{businessPlan.title}</h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/business-plans">戻る</Link>
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
            <div className="grid gap-4">
              <div>
                <h3 className="mb-2 font-semibold">説明</h3>
                <p className="text-gray-600">{businessPlan.description || "説明なし"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-semibold">期間</h3>
                  <p className="text-gray-600">
                    {formatDate(businessPlan.startDate)}
                    {" "}
                    〜
                    {" "}
                    {formatDate(businessPlan.endDate)}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">ステータス</h3>
                  <p className="text-gray-600">{businessPlan.status || "未設定"}</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 font-semibold">What（何を）</h3>
                <p className="text-gray-600">{businessPlan.context?.what || "未設定"}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">When（いつ）</h3>
                <p className="text-gray-600">{businessPlan.context?.when || "未設定"}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Where（どこで）</h3>
                <p className="text-gray-600">{businessPlan.context?.where || "未設定"}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Who（誰が）</h3>
                <p className="text-gray-600">{businessPlan.context?.who || "未設定"}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Why（なぜ）</h3>
                <p className="text-gray-600">{businessPlan.context?.why || "未設定"}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">How（どのように）</h3>
                <p className="text-gray-600">{businessPlan.context?.how || "未設定"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ガントチャート */}
        <Card>
          <CardHeader>
            <CardTitle>進捗状況</CardTitle>
          </CardHeader>
          <CardContent>
            {businessPlan.startDate && businessPlan.endDate
              ? (
                  <BusinessPlanGantt
                    startDate={businessPlan.startDate}
                    endDate={businessPlan.endDate}
                    actionItems={businessPlan.actionItems || []}
                    milestones={businessPlan.milestones || []}
                  />
                )
              : (
                  <p className="text-center text-gray-500">期間が設定されていないためガントチャートを表示できません</p>
                )}
          </CardContent>
        </Card>

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
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {actionItemCounts.todo}
                      </p>
                      <p className="text-sm text-gray-500">未着手</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {actionItemCounts.in_progress}
                      </p>
                      <p className="text-sm text-gray-500">進行中</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {actionItemCounts.completed}
                      </p>
                      <p className="text-sm text-gray-500">完了</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
