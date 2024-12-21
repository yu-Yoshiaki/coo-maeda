import { ChatContainer } from "~/components/chat/ChatContainer"
import { MobileNav } from "~/components/shared/MobileNav"
import { Sidebar } from "~/components/shared/Sidebar"

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* デスクトップサイドバー */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">
        <ChatContainer />
      </main>

      {/* モバイルナビゲーション */}
      <MobileNav />
    </div>
  )
}

export default App
