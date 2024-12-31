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
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        <div>{children}</div>
        <div className="lg:sticky lg:top-8">
          <BusinessPlanAgent plan={businessPlan} />
        </div>
      </div>
    </div>
  )
}
