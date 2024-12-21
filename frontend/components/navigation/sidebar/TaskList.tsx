import type { FC } from "react"
import { CheckCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  progress: number
}

export const TaskList: FC = () => {
  // TODO: タスクデータをAPIから取得
  const tasks: Task[] = [
    { id: "1", title: "新規事業企画", progress: 20 },
    { id: "2", title: "MTG準備", progress: 0 },
    { id: "3", title: "経費精算", progress: 50 },
  ]

  return (
    <div>
      <h3 className="mb-3 flex items-center space-x-2 font-medium">
        <CheckCircle className="size-5" />
        <span>タスク一覧</span>
      </h3>
      <ul className="ml-7 space-y-2">
        {tasks.map(task => (
          <li key={task.id}>
            {task.title}
            {" "}
            (
            {task.progress}
            %)
          </li>
        ))}
      </ul>
    </div>
  )
}
