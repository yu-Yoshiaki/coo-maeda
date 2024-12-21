"use client"

import { Calendar, LayoutDashboard, Menu, Target } from "lucide-react"
import { useState } from "react"
import { MobileMenu } from "./MobileMenu"
import { MobileNavItem } from "./MobileNavItem"

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: "ホーム",
      isActive: true,
    },
    {
      icon: Calendar,
      label: "スケジュール",
      badge: "3",
    },
    {
      icon: Target,
      label: "タスク",
      badge: "5",
    },
    {
      icon: Menu,
      label: "メニュー",
      onClick: () => setIsMenuOpen(true),
    },
  ]

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white px-2 pb-2 pt-1 md:hidden">
        <div className="flex items-center justify-around">
          {mainNavItems.map(item => (
            <MobileNavItem key={item.label} {...item} />
          ))}
        </div>
      </nav>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
