import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("business_plans")
    .select(`
      id,
      title,
      status,
      action_items (
        status
      )
    `)
    .order("created_at", { ascending: false })

  // 進捗率を計算する関数
  const calculateProgress = (actionItems: { status: string }[] = []) => {
    if (actionItems.length === 0)
      return 0
    const completed = actionItems.filter(
      item => item.status === "completed",
    ).length
    return Math.round((completed / actionItems.length) * 100)
  }

  return (
    <div className="flex min-h-screen">
      {/* サイドメニュー */}
      <div className="w-64 border-r bg-gray-50/40">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">事業計画一覧</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/business-plans/new">新規作成</Link>
            </Button>
          </div>
          <nav className="space-y-1">
            {plans?.map((plan) => {
              const progress = calculateProgress(plan.action_items)
              return (
                <Button
                  key={plan.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left",
                    "hover:bg-gray-100",
                  )}
                  asChild
                >
                  <Link href={`/business-plans/${plan.id}`}>
                    <div className="w-full space-y-2">
                      <div className="truncate">{plan.title}</div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-1.5" />
                        <span className="text-xs text-gray-500">
                          {progress}
                          %
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{plan.status}</div>
                    </div>
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">{children}</div>
    </div>
  )
}
