"use client"

import { useState } from "react"
import { useScheduleAnalyzer } from "../hooks/useScheduleAnalyzer"

export function ScheduleAnalyzer() {
  const { loading, error, result, analyzeSchedule } = useScheduleAnalyzer()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [includePatternAnalysis, setIncludePatternAnalysis] = useState(true)
  const [includeTimeDistribution, setIncludeTimeDistribution] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await analyzeSchedule({
      startDate,
      endDate,
      includePatternAnalysis,
      includeTimeDistribution,
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">スケジュール分析</h2>

      {/* 分析フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              開始日
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              終了日
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="patternAnalysis"
              checked={includePatternAnalysis}
              onChange={e => setIncludePatternAnalysis(e.target.checked)}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="patternAnalysis" className="ml-2 block text-sm text-gray-700">
              パターン分析を含める
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="timeDistribution"
              checked={includeTimeDistribution}
              onChange={e => setIncludeTimeDistribution(e.target.checked)}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="timeDistribution" className="ml-2 block text-sm text-gray-700">
              時間帯分布を含める
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {loading ? "分析中..." : "分析開始"}
        </button>
      </form>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 分析結果の表示 */}
      {result && (
        <div className="space-y-6 rounded-lg border p-6">
          {/* サマリー */}
          <div>
            <h3 className="text-lg font-semibold">概要</h3>
            <dl className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">総予定数</dt>
                <dd className="text-lg font-medium">
                  {result.summary.totalEvents}
                  件
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">1日あたりの平均</dt>
                <dd className="text-lg font-medium">
                  {result.summary.averageEventsPerDay.toFixed(1)}
                  件
                </dd>
              </div>
            </dl>
          </div>

          {/* 時間帯分布 */}
          {result.timeDistribution && (
            <div>
              <h3 className="text-lg font-semibold">時間帯分布</h3>
              <dl className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">午前</dt>
                  <dd className="text-lg font-medium">
                    {result.timeDistribution.morningEvents}
                    件
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">午後</dt>
                  <dd className="text-lg font-medium">
                    {result.timeDistribution.afternoonEvents}
                    件
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">夜間</dt>
                  <dd className="text-lg font-medium">
                    {result.timeDistribution.eveningEvents}
                    件
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* パターン */}
          {result.patterns && (
            <div>
              <h3 className="text-lg font-semibold">パターン分析</h3>
              <div className="mt-2 space-y-4">
                {result.patterns.regularEvents.map((event, index) => (
                  <div key={index} className="rounded-md bg-gray-50 p-4">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      頻度:
                      {event.frequency}
                    </p>
                    <p className="text-sm text-gray-600">
                      提案:
                      {event.suggestedOptimization}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 推奨事項 */}
          <div>
            <h3 className="text-lg font-semibold">推奨事項</h3>
            <div className="mt-2 space-y-4">
              <div>
                <h4 className="font-medium">スケジューリング</h4>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {result.recommendations.scheduling.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">最適化</h4>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {result.recommendations.optimization.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">ワークライフバランス</h4>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {result.recommendations.workLifeBalance.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
