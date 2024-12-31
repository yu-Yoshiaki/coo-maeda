'use client'

import { useState } from 'react'
import { Schedule } from '../types/Schedule'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ScheduleListProps {
  schedules?: Schedule[]
  loading?: boolean
}

export function ScheduleList({ schedules = [], loading = false }: ScheduleListProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  if (schedules.length === 0) {
    return <div className="text-center py-4 text-gray-500">予定はありません</div>
  }

  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = format(new Date(schedule.start), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(schedule)
    return groups
  }, {} as Record<string, Schedule[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
        <div key={date} className="space-y-2">
          <h3 className="font-medium">
            {format(new Date(date), 'M月d日（E）', { locale: ja })}
          </h3>
          <div className="space-y-1">
            {daySchedules.map(schedule => (
              <button
                key={schedule.id}
                onClick={() => setSelectedSchedule(schedule)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{schedule.title}</div>
                    {schedule.location && (
                      <div className="text-sm text-gray-500">{schedule.location}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(schedule.start), 'HH:mm')}
                    {!schedule.isAllDay && (
                      <>
                        {' - '}
                        {format(new Date(schedule.end), 'HH:mm')}
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* スケジュール詳細モーダル */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{selectedSchedule.title}</h2>
                <p className="text-gray-500">
                  {format(new Date(selectedSchedule.start), 'M月d日（E） HH:mm', { locale: ja })}
                  {!selectedSchedule.isAllDay && (
                    <>
                      {' - '}
                      {format(new Date(selectedSchedule.end), 'HH:mm')}
                    </>
                  )}
                </p>
              </div>

              {selectedSchedule.description && (
                <p className="text-gray-700">{selectedSchedule.description}</p>
              )}

              {selectedSchedule.location && (
                <div>
                  <h3 className="font-medium">場所</h3>
                  <p className="text-gray-700">{selectedSchedule.location}</p>
                </div>
              )}

              {selectedSchedule.attendees && selectedSchedule.attendees.length > 0 && (
                <div>
                  <h3 className="font-medium">参加者</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedSchedule.attendees.map((attendee, index) => (
                      <li key={index}>{attendee}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 