import type { LucideIcon } from "lucide-react"

interface MobileNavItemProps {
  icon: LucideIcon
  label: string
  badge?: string
  isActive?: boolean
  onClick?: () => void
}

export function MobileNavItem({
  icon: Icon,
  label,
  badge,
  isActive = false,
  onClick,
}: MobileNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center rounded-xl p-2 ${
        isActive ? "text-blue-600" : "text-gray-600"
      }`}
    >
      <div className="relative">
        <Icon className="size-6" />
        {badge && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
            {badge}
          </span>
        )}
      </div>
      <span className="mt-1 text-xs">{label}</span>
    </button>
  )
}
