import type { LucideIcon } from "lucide-react"

interface NavigationItemProps {
  icon: LucideIcon
  label: string
  badge?: string
  color: string
  isActive?: boolean
}

export function NavigationItem({
  icon: Icon,
  label,
  badge,
  color,
  isActive = false,
}: NavigationItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
        isActive
          ? `${color} font-medium`
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className={`size-5 ${isActive ? "" : "text-gray-400"}`} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          isActive
            ? "bg-white/25"
            : "bg-gray-100 text-gray-600"
        }`}
        >
          {badge}
        </span>
      )}
    </a>
  )
}
