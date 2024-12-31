import { Loading } from "@/components/ui/Loading"
import { BusinessPlanAIAnalyzer } from "@/features/business-plan/components/BusinessPlanAIAnalyzer"
import { BusinessPlanGantt } from "@/features/business-plan/components/BusinessPlanGantt"
import { BusinessPlanList } from "@/features/business-plan/components/BusinessPlanList"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"

// export const metadata = {
//   title: "事業計画管理 - COO前田くんAI",
//   description: "事業計画の作成、管理、分析を行います",
// }

export default async function BusinessPlansPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from("business_plans")
    .select(`
      *,
      action_items (*),
      milestones (*)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">事業計画管理</h1>
        <p className="mt-2 text-gray-600">
          AIを活用して事業計画を作成・管理できます。
          自然言語で事業計画を入力すると、AIが分析して具体的なアクションアイテムを提案します。
        </p>
      </div>

      <div className="space-y-8">
        <BusinessPlanAIAnalyzer />

        <Suspense fallback={<Loading />}>
          {plans && plans.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">最新の事業計画進捗</h2>
              <BusinessPlanGantt
                startDate={plans[0].start_date}
                endDate={plans[0].end_date}
                actionItems={plans[0].action_items}
                milestones={plans[0].milestones}
              />
            </div>
          )}
          <BusinessPlanList />
        </Suspense>
      </div>
    </div>
  )
}
