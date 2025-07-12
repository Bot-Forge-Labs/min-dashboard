import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ServerOverview } from "@/components/dashboard/server-overview"
import { SetupBanner } from "@/components/setup-banner"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/10" />
          <Skeleton className="h-4 w-96 bg-white/10" />
        </div>
        <Skeleton className="h-6 w-24 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <SetupBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-emerald-200/80">Welcome back! Here's what's happening with your bot.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
          Bot Online
        </Badge>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={
            <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 h-96">
              <CardContent className="p-6">
                <Skeleton className="h-full w-full bg-white/10" />
              </CardContent>
            </Card>
          }
        >
          <RecentActivity />
        </Suspense>
        <Suspense
          fallback={
            <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 h-96">
              <CardContent className="p-6">
                <Skeleton className="h-full w-full bg-white/10" />
              </CardContent>
            </Card>
          }
        >
          <ServerOverview />
        </Suspense>
      </div>
    </div>
  )
}
