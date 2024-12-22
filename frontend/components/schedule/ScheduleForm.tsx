"use client"

import type { Schedule } from "@/lib/validations/schedule"
import { useState } from "react"

interface ScheduleFormProps {
  initialData?: Partial<Schedule>
  onSubmit: (data: Partial<Schedule>) => Promise<void>
  onCancel?: () => void
}

export function ScheduleForm({
  initialData,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<Partial<Schedule>>(
    initialData || {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      isAllDay: false,
      location: "",
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          説明
        </label>
        <textarea
          id="description"
          value={formData.description || ""}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">
            開始日時
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={formData.startDate?.toISOString().slice(0, 16)}
            onChange={e =>
              setFormData({ ...formData, startDate: new Date(e.target.value) })}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium">
            終了日時
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={formData.endDate?.toISOString().slice(0, 16)}
            onChange={e =>
              setFormData({ ...formData, endDate: new Date(e.target.value) })}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isAllDay}
            onChange={e => setFormData({ ...formData, isAllDay: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">終日</span>
        </label>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium">
          場所
        </label>
        <input
          type="text"
          id="location"
          value={formData.location || ""}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  )
}
