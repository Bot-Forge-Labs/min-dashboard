import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { AnalyticsStats } from "@/components/analytics/analytics-stats"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-emerald-200/80">Track bot performance and user engagement.</p>
      </div>

      <AnalyticsStats />
      <AnalyticsCharts />
    </div>
  )
}
