import { KPISummary } from "./KPISummary"
import { NavigationMenu } from "./NavigationMenu"
import { QuickActions } from "./QuickActions"
import { SidebarHeader } from "./SidebarHeader"
import { TaskSummary } from "./TaskSummary"

export function Sidebar() {
  return (
    <aside className="flex h-full w-80 flex-col border-r border-gray-100 bg-white">
      <SidebarHeader />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <QuickActions />
        <NavigationMenu />
        <TaskSummary />
        <KPISummary />
      </div>
    </aside>
  )
}
