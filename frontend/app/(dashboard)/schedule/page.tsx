import { ScheduleManager } from "@/components/schedule/ScheduleManager"

export default function SchedulePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <p className="text-gray-600">
          カレンダーで予定を管理したり、自然な言葉で予定を作成できます。
        </p>
      </div>

      <ScheduleManager />
    </div>
  )
}
