"use client"

import { useAuthContext } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { user } = useAuthContext()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">ダッシュボード</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">ようこそ</h2>
        <p className="text-gray-600">
          {user?.email}
          {" "}
          としてログインしています。
        </p>
      </div>
    </div>
  )
}
