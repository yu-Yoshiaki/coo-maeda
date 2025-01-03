"use client"

import type { ProgressReport } from "../types"
import { useState } from "react"
import { useProgress } from "../hooks/useProgress"

export function ProgressTracker() {
  const {
    tasks,
    milestones,
    risks,
    alerts,
    loading,
    error,
    updateProgress,
    generateReport,
    markAlertAsRead,
  } = useProgress()

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [report, setReport] = useState<ProgressReport | null>(null)

  const handleGenerateReport = async () => {
    const result = await generateReport()
    if (result.data) {
      setReport(result.data)
    }
  }

  if (loading) {
    return <div className="p-4">読み込み中...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const filteredTasks = selectedMilestone
    ? tasks.filter(task =>
        milestones.find(m => m.id === selectedMilestone)?.tasks.includes(task.id),
      )
    : tasks

  return (
    <div className="space-y-6 p-4">
      {/* マイルストーン選択 */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">マイルストーン</h2>
        <select
          className="w-full rounded border p-2"
          value={selectedMilestone || ""}
          onChange={e => setSelectedMilestone(e.target.value || null)}
        >
          <option value="">全て表示</option>
          {milestones.map(milestone => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title}
              {" "}
              (
              {Math.round(milestone.progress)}
              %)
            </option>
          ))}
        </select>
      </div>

      {/* タスクリスト */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">タスク</h2>
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div key={task.id} className="space-y-2 rounded border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{task.title}</h3>
                <span className={`rounded px-2 py-1 text-sm ${
                  task.status === "COMPLETED"
                    ? "bg-green-100"
                    : task.status === "IN_PROGRESS"
                      ? "bg-blue-100"
                      : task.status === "BLOCKED"
                        ? "bg-red-100"
                        : "bg-gray-100"
                }`}
                >
                  {task.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress}
                  onChange={e => updateProgress({ taskId: task.id, progress: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm">
                  {task.progress}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* リスク */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">リスク</h2>
        <div className="space-y-2">
          {risks.map(risk => (
            <div key={risk.id} className="space-y-2 rounded border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{risk.title}</h3>
                <span className={`rounded px-2 py-1 text-sm ${
                  risk.severity === "CRITICAL"
                    ? "bg-red-100"
                    : risk.severity === "HIGH"
                      ? "bg-orange-100"
                      : risk.severity === "MEDIUM"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                }`}
                >
                  {risk.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600">{risk.description}</p>
              <p className="text-sm">
                <strong>影響:</strong>
                {" "}
                {risk.impact}
              </p>
              <p className="text-sm">
                <strong>対策:</strong>
                {" "}
                {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* アラート */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">アラート</h2>
        <div className="space-y-2">
          {alerts.filter(alert => !alert.isRead).map(alert => (
            <div key={alert.id} className="space-y-2 rounded border p-4">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-sm ${
                  alert.type === "DELAY"
                    ? "bg-red-100"
                    : alert.type === "RISK"
                      ? "bg-orange-100"
                      : alert.type === "MILESTONE"
                        ? "bg-blue-100"
                        : "bg-yellow-100"
                }`}
                >
                  {alert.type}
                </span>
                <button
                  type="button"
                  onClick={() => markAlertAsRead(alert.id)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  既読にする
                </button>
              </div>
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* レポート生成ボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerateReport}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          進捗レポート生成
        </button>
      </div>

      {/* レポート表示 */}
      {report && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">進捗レポート</h2>
          <div className="space-y-4 rounded border p-4">
            <h3 className="font-semibold">{report.title}</h3>
            <p className="text-sm">
              生成日時:
              {new Date(report.generatedAt).toLocaleString()}
            </p>
            <p className="text-lg">
              全体進捗:
              {Math.round(report.overallProgress)}
              %
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">推奨事項:</h4>
              <ul className="list-inside list-disc space-y-1">
                {report.recommendations.map((rec: string, index: number) => (
                  <li key={`rec-${index}`} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
