import { TrendingDown, TrendingUp } from "lucide-react"

export function KPISummary() {
  const kpis = [
    {
      label: "売上",
      value: "¥12.8M",
      trend: "up",
      change: "+12%",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "利益率",
      value: "23%",
      trend: "up",
      change: "+5%",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "経費",
      value: "¥4.2M",
      trend: "down",
      change: "-8%",
      color: "bg-red-50 text-red-600",
    },
  ]

  return (
    <div className="rounded-2xl bg-gray-50/50 p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">KPIサマリー</h2>
      <div className="space-y-3">
        {kpis.map(kpi => (
          <div
            key={kpi.label}
            className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white"
          >
            <div className="text-sm text-gray-500">{kpi.label}</div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{kpi.value}</span>
              <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${kpi.color}`}>
                {kpi.trend === "up"
                  ? (
                      <TrendingUp className="size-3" />
                    )
                  : (
                      <TrendingDown className="size-3" />
                    )}
                <span>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
