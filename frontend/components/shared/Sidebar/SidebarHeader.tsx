import { Bot } from "lucide-react"

export function SidebarHeader() {
  return (
    <div className="border-b bg-white px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-2">
          <Bot className="size-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">COO前田くんAI</h1>
          <p className="text-sm text-gray-500">あなたの経営パートナー</p>
        </div>
      </div>
    </div>
  )
}
