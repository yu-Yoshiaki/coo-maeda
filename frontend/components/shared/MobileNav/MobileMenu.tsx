import { FileText, Settings, TrendingUp, Users, X } from "lucide-react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuItems = [
    { icon: TrendingUp, label: "KPI" },
    { icon: Users, label: "チーム" },
    { icon: FileText, label: "レポート" },
    { icon: Settings, label: "設定" },
  ]

  if (!isOpen)
    return null

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <button type="button" onClick={onClose} className="p-2">
            <X className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label }) => (
              <button
                type="button"
                key={label}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-gray-600 hover:bg-gray-50"
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
