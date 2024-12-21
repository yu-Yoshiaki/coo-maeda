"use client"

import type { FC, ReactNode } from "react"
import { Header } from "@/components/navigation/Header"
import { SideDrawer } from "@/components/navigation/SideDrawer"
import { useState } from "react"

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onMenuClick={toggleDrawer} />
      <div className="flex flex-1 overflow-hidden">
        <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
