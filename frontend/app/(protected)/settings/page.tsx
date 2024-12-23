"use client"

import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { signOut } = useAuth()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">設定</h1>
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">アカウント設定</h2>
          <div className="space-y-4">
            <div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
