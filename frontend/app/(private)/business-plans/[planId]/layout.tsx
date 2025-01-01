import type { BusinessPlan } from "@/features/business-plan/types/BusinessPlan"
import { BusinessPlanAgent } from "@/features/business-plan/components/BusinessPlanAgent"
import { createClient } from "@/lib/supabase/server"
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

  return (
    <div className="grid h-full grid-cols-[1fr,400px]">
      <div className="overflow-auto p-8">{children}</div>
      {/* AIアシスタント */}
      <div className="border-l bg-gray-50/40">
        <div className="sticky top-0 h-screen overflow-auto p-4">
          <BusinessPlanAgent plan={businessPlan} />
        </div>
      </div>
    </div>
  )
}
