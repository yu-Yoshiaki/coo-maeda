"use client"

import type { BusinessPlan } from "../types/BusinessPlan"
import { useCallback } from "react"
import useSWR from "swr"
import { businessPlanApi } from "../api/businessPlanApi"

export function BusinessPlanList() {
  const { data: plans, error, mutate } = useSWR<BusinessPlan[]>("business-plans", () => businessPlanApi.getAll())

  const handleDelete = useCallback(async (id: string) => {
    try {
      await businessPlanApi.delete(id)
      mutate()
    }
    catch (error) {
      console.error("Failed to delete business plan:", error)
    }
  }, [mutate])

  if (error) {
    return (
      <div className="text-red-500">
        エラーが発生しました:
        {" "}
        {error.message}
      </div>
    )
  }

  if (!plans) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map(plan => (
        <div key={plan.id} className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
              {plan.status}
            </span>
          </div>

          <p className="mb-4 text-gray-600">{plan.description}</p>

          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              開始:
              {" "}
              {new Date(plan.startDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">
              終了:
              {" "}
              {new Date(plan.endDate).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = `/business-plans/${plan.id}`}
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                詳細
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
