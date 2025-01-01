import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, File } from "lucide-react"
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

  // サブメニューアイテム
  const getSubMenuItems = (planId: string) => [
    {
      href: `/business-plans/${planId}`,
      label: "概要",
    },
    {
      href: `/business-plans/${planId}/action-items`,
      label: "アクションアイテム",
    },
    {
      href: `/business-plans/${planId}/milestones`,
      label: "マイルストーン",
    },
    {
      href: `/business-plans/${planId}/risks`,
      label: "リスク管理",
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* サイドメニュー */}
      <div className="w-64 border-r bg-gray-50/40">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">事業計画一覧</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/business-plans">新規作成</Link>
            </Button>
          </div>
          <nav className="space-y-1">
            {plans?.map((plan) => {
              const progress = calculateProgress(plan.action_items)
              return (
                <div key={plan.id} className="group">
                  <details className="[&[open]>summary]:bg-gray-100">
                    <summary className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100">
                      <ChevronRight className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-90" />
                      <div className="flex-1">
                        <div className="truncate">{plan.title}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-1.5" />
                          <span className="text-xs text-gray-500">
                            {progress}
                            %
                          </span>
                        </div>
                      </div>
                    </summary>
                    <div className="ml-6 mt-1 space-y-1">
                      {getSubMenuItems(plan.id).map(item => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-sm"
                          asChild
                        >
                          <Link href={item.href}>
                            <File className="size-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </details>
                </div>
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
