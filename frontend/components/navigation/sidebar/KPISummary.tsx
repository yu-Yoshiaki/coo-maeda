import type { FC } from "react"
import { BarChart2, TrendingDown, TrendingUp } from "lucide-react"

interface KPI {
  id: string
  label: string
  value: number
  trend: "up" | "down"
}

export const KPISummary: FC = () => {
  // TODO: KPIデータをAPIから取得
  const kpis: KPI[] = [
    { id: "1", label: "売上", value: 120, trend: "up" },
    { id: "2", label: "経費", value: 90, trend: "down" },
  ]

  const getTrendIcon = (trend: KPI["trend"]) => {
    return trend === "up"
      ? (
          <TrendingUp className="size-4 text-green-500" />
        )
      : (
          <TrendingDown className="size-4 text-red-500" />
        )
  }

  return (
    <div>
      <h3 className="mb-3 flex items-center space-x-2 font-medium">
        <BarChart2 className="size-5" />
        <span>KPIサマリー</span>
      </h3>
      <ul className="ml-7 space-y-2">
        {kpis.map(kpi => (
          <li key={kpi.id} className="flex items-center space-x-2">
            <span>
              {kpi.label}
              :
              {" "}
              {kpi.value}
              %
            </span>
            {getTrendIcon(kpi.trend)}
          </li>
        ))}
      </ul>
    </div>
  )
}
