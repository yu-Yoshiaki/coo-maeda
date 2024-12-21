import { Calendar, MessageCircle, Plus } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "タスク作成",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      icon: MessageCircle,
      label: "チャット",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      icon: Calendar,
      label: "予定追加",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ icon: Icon, label, color }) => (
        <button
          type="button"
          key={label}
          className={`flex flex-col items-center rounded-2xl p-3 transition-all ${color}`}
        >
          <Icon className="mb-1 size-5" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}
