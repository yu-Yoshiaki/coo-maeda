import { Calendar, LayoutDashboard, Settings, Target } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">COO前田くんAI</h1>
      </div>

      <nav className="space-y-2">
        <a href="#" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100">
          <LayoutDashboard className="size-5" />
          <span>タスク一覧</span>
        </a>
        <a href="#" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100">
          <Calendar className="size-5" />
          <span>スケジュール</span>
        </a>
        <a href="#" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100">
          <Target className="size-5" />
          <span>KPI</span>
        </a>
        <a href="#" className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100">
          <Settings className="size-5" />
          <span>設定</span>
        </a>
      </nav>
    </div>
  )
}
