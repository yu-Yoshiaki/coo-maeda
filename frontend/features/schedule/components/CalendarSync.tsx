'use client'

import { useState } from 'react'

interface CalendarProvider {
  id: string
  name: string
  icon: string
  connected: boolean
}

const providers: CalendarProvider[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '📅',
    connected: false,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: '📆',
    connected: false,
  },
]

export function CalendarSync() {
  const [syncStatus, setSyncStatus] = useState<Record<string, boolean>>(
    Object.fromEntries(providers.map(p => [p.id, p.connected]))
  )

  const handleSync = async (providerId: string) => {
    // TODO: 実際の同期処理を実装
    setSyncStatus(prev => ({
      ...prev,
      [providerId]: !prev[providerId],
    }))
  }

  return (
    <div className="space-y-4">
      {providers.map(provider => (
        <div
          key={provider.id}
          className="flex items-center justify-between p-3 border rounded-md"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{provider.icon}</span>
            <span className="font-medium">{provider.name}</span>
          </div>
          <button
            onClick={() => handleSync(provider.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              syncStatus[provider.id]
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {syncStatus[provider.id] ? '同期中' : '同期する'}
          </button>
        </div>
      ))}

      <div className="text-sm text-gray-500">
        最終同期: {new Date().toLocaleString('ja-JP')}
      </div>
    </div>
  )
} 