import type { FC } from "react"
import { Calendar } from "lucide-react"

interface Event {
  id: string
  title: string
  datetime: string
}

export const Schedule: FC = () => {
  // TODO: スケジュールデータをAPIから取得
  const events: Event[] = [
    { id: "1", title: "A社MTG", datetime: "12/22 10:00" },
    { id: "2", title: "戦略会議", datetime: "12/22 14:00" },
  ]

  return (
    <div>
      <h3 className="mb-3 flex items-center space-x-2 font-medium">
        <Calendar className="size-5" />
        <span>今週のスケジュール</span>
      </h3>
      <ul className="ml-7 space-y-2">
        {events.map(event => (
          <li key={event.id}>
            {event.datetime}
            {" "}
            {event.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
