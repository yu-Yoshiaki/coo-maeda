import type { BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { Button } from "@/components/ui/button"
import { BusinessPlanAgent } from "@/features/business-plan/components/BusinessPlanAgent"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BusinessPlanLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  // サイドメニューアイテム
  const menuItems = [
    {
      href: `/business-plans/${plan.id}`,
      label: "概要",
    },
    {
      href: `/business-plans/${plan.id}/action-items`,
      label: "アクションアイテム",
    },
    {
      href: `/business-plans/${plan.id}/milestones`,
      label: "マイルストーン",
    },
    {
      href: `/business-plans/${plan.id}/risks`,
      label: "リスク管理",
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* サイドメニュー */}
      <div className="w-64 border-r bg-gray-50/40">
        <div className="p-4">
          <h2 className="mb-4 truncate text-lg font-semibold">{plan.title}</h2>
          <nav className="space-y-1">
            {menuItems.map(item => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  item.href === `/business-plans/${params.planId}`
                    ? "bg-gray-100"
                    : "hover:bg-gray-100",
                )}
                asChild
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">
        <div className="grid h-full grid-cols-[1fr,400px]">
          <div className="overflow-auto p-8">{children}</div>
          {/* AIアシスタント */}
          <div className="border-l bg-gray-50/40">
            <div className="sticky top-0 h-screen overflow-auto p-4">
              <BusinessPlanAgent plan={businessPlan} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
