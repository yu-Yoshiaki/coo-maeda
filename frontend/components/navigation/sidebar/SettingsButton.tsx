import type { FC } from "react"
import { Settings } from "lucide-react"

export const SettingsButton: FC = () => {
  return (
    <button
      type="button"
      className="flex w-full items-center space-x-2 rounded-lg p-2 hover:bg-gray-100"
      onClick={() => {
        // TODO: 設定画面への遷移処理
      }}
    >
      <Settings className="size-5" />
      <span>設定</span>
    </button>
  )
}
