"use client"

import { useAuthContext } from "@/contexts/AuthContext"

export default function ProfilePage() {
  const { user } = useAuthContext()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">プロフィール</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">メールアドレス</h2>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">ユーザーID</h2>
            <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">最終ログイン</h2>
            <p className="mt-1 text-sm text-gray-900">
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString("ja-JP")
                : "情報なし"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
