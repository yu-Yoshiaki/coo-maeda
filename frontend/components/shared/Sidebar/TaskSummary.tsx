import { CheckCircle2 } from "lucide-react"

export function TaskSummary() {
  const tasks = [
    { id: 1, title: "経営戦略MTG", status: "進行中", dueDate: "今日" },
    { id: 2, title: "四半期レビュー", status: "未着手", dueDate: "明日" },
    { id: 3, title: "採用面接", status: "完了", dueDate: "完了" },
  ]

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "完了":
        return "bg-green-50 text-green-600"
      case "進行中":
        return "bg-blue-50 text-blue-600"
      case "未着手":
        return "bg-yellow-50 text-yellow-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="rounded-2xl bg-gray-50/50 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">今日のタスク</h2>
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all hover:bg-white"
          >
            <CheckCircle2 className={`size-4 ${
              task.status === "完了"
                ? "text-green-500"
                : "text-gray-300 group-hover:text-gray-400"
            }`}
            />
            <span className="flex-1 truncate text-sm text-gray-600 group-hover:text-gray-900">
              {task.title}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs ${getStatusStyles(task.status)}`}>
              {task.dueDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
