import type { ReactNode } from "react"

interface ScheduleLayoutProps {
  children: ReactNode
}

export default function ScheduleLayout({ children }: ScheduleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  )
}
