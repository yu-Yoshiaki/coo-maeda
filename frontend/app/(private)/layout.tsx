import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { ChevronRight, File, Sparkles } from "lucide-react"
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
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* サイドメニュー */}
      <div className="w-64 border-r bg-white/80 shadow-lg backdrop-blur-sm">
        <div className="p-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent">
              <Sparkles className="size-5 text-yellow-400" />
              事業計画一覧
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="border-none bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              asChild
            >
              <Link href="/business-plans">新規作成</Link>
            </Button>
          </div>
          <nav className="space-y-2">
            {plans?.map((plan) => {
              const progress = calculateProgress(plan.action_items)
              return (
                <div key={plan.id} className="group">
                  <details className="rounded-lg [&[open]>summary]:bg-gradient-to-r [&[open]>summary]:from-purple-100 [&[open]>summary]:to-pink-100">
                    <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                      <ChevronRight className="size-4 shrink-0 text-purple-500 transition-transform duration-300 group-open:rotate-90" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-700">{plan.title}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress
                            value={progress}
                            className="h-2 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
                          />
                          <span className="shrink-0 text-xs font-medium text-purple-600">
                            {progress}
                            %
                          </span>
                        </div>
                      </div>
                    </summary>
                    <div className="ml-6 mt-2 space-y-1">
                      {getSubMenuItems(plan.id).map(item => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                          asChild
                        >
                          <Link href={item.href} className="min-w-0">
                            <File className="size-4 shrink-0 text-purple-500" />
                            <span className="truncate text-gray-600 transition-colors hover:text-purple-600">{item.label}</span>
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
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
