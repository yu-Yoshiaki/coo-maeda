import type { FC } from "react"
import { Bell, Menu, User } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="メニュー"
        >
          <Menu className="size-6" />
        </button>
        <h1 className="text-xl font-semibold">COO前田くんAI</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="通知"
        >
          <Bell className="size-6" />
        </button>
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="プロフィール"
        >
          <User className="size-6" />
        </button>
      </div>
    </header>
  )
}
