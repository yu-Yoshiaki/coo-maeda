import BusinessPlanAIAnalyzer from "@/features/business-plan/components/BusinessPlanAIAnalyzer"

// export const metadata = {
//   title: "事業計画管理 - COO前田くんAI",
//   description: "事業計画の作成、管理、分析を行います",
// }

export default async function BusinessPlansPage() {
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
      </div>
    </div>
  )
}
