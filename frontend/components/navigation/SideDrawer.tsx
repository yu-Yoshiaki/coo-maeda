import type { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { KPISummary } from "./sidebar/KPISummary"
import { Schedule } from "./sidebar/Schedule"
import { SettingsButton } from "./sidebar/SettingsButton"
import { TaskList } from "./sidebar/TaskList"

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const SideDrawer: FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />

          {/* ドロワー */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg lg:relative"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold">クイックビュー</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                aria-label="閉じる"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto p-4">
              <TaskList />
              <Schedule />
              <KPISummary />
            </nav>

            <div className="border-t border-gray-200 p-4">
              <SettingsButton />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
