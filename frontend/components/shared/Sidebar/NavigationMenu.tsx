import { Calendar, FileText, LayoutDashboard, Settings, Target, TrendingUp, Users } from "lucide-react"

import { NavigationItem } from "./NavigationItem"

export function NavigationMenu() {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "ダッシュボード",
      badge: "",
      color: "bg-blue-50 text-blue-600",
      isActive: true,
    },
    {
      icon: Calendar,
      label: "スケジュール",
      badge: "3",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Target,
      label: "タスク管理",
      badge: "5",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: TrendingUp,
      label: "KPI",
      badge: "",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: Users,
      label: "チーム",
      badge: "",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: FileText,
      label: "レポート",
      badge: "",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: Settings,
      label: "設定",
      badge: "",
      color: "bg-gray-50 text-gray-600",
    },
  ]

  return (
    <nav className="space-y-1">
      {menuItems.map(item => (
        <NavigationItem
          key={item.label}
          {...item}
        />
      ))}
    </nav>
  )
}
