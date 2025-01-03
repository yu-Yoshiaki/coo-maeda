// import type { Metadata } from "next"

// export const metadata: Metadata = {
//   title: "COO前田くんAI - ビジネスをサポートするAIツール",
//   description: "AIがあなたのビジネスをサポート。事業計画から日々のタスク管理まで。無料で始められます。",
//   robots: {
//     index: true,
//     follow: true,
//   },
// }

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヒーローセクション */}
      <section className="px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold">COO前田くんAI</h1>
        <p className="mb-8 text-xl text-gray-600">
          AIがあなたのビジネスをサポート。事業計画から日々のタスク管理まで。
        </p>
        <a
          href="/login"
          className="rounded-lg bg-blue-600 px-8 py-3 text-white transition hover:bg-blue-700"
        >
          無料で始める
        </a>
      </section>

      {/* 特徴セクション */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="p-6 text-center">
            <h3 className="mb-4 text-xl font-semibold">事業計画支援</h3>
            <p className="text-gray-600">
              AIが事業計画の作成から実行までサポート
            </p>
          </div>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-xl font-semibold">スケジュール最適化</h3>
            <p className="text-gray-600">
              自然言語でスケジュール管理を効率化
            </p>
          </div>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-xl font-semibold">KPI分析</h3>
            <p className="text-gray-600">
              リアルタイムでKPIを分析し改善提案
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
