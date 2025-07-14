import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SetupBanner } from "@/components/setup-banner"
import { StatsCards } from "@/components/dashboard/stats-cards"

// Import components that don't use client-side code during SSR
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

// Simple stats component that doesn't require Supabase during build
function SimpleStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-emerald-200">Total Servers</h3>
          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
            />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">--</div>
          <p className="text-xs text-emerald-300/60">Configure Supabase to see data</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-emerald-200">Total Users</h3>
          <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">--</div>
          <p className="text-xs text-emerald-300/60">Configure Supabase to see data</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-emerald-200">Bot Uptime</h3>
          <svg className="h-4 w-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">--</div>
          <p className="text-xs text-emerald-300/60">Configure Supabase to see data</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-emerald-200">Commands/Day</h3>
          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">--</div>
          <p className="text-xs text-emerald-300/60">Configure Supabase to see data</p>
        </CardContent>
      </Card>
    </div>
  )
}

function SimpleRecentActivity() {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <h3 className="text-white font-semibold">Recent Activity</h3>
        <p className="text-emerald-200/80 text-sm">Latest moderation actions across all servers</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-emerald-400/40 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-emerald-200/60 mb-2">No recent activity</p>
          <p className="text-sm text-emerald-300/40">Configure your Supabase connection to see moderation logs</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SimpleServerOverview() {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <h3 className="text-white font-semibold">Server Overview</h3>
        <p className="text-emerald-200/80 text-sm">Your most active servers</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-emerald-400/40 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
            />
          </svg>
          <p className="text-emerald-200/60 mb-2">No servers found</p>
          <p className="text-sm text-emerald-300/40">
            Configure your Supabase connection and add servers to see them here
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Dynamic Setup Banner - Client Component */}
      <SetupBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-emerald-200/80">Welcome back! Here's what's happening with your bot.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
          Bot Online
        </Badge>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleRecentActivity />
        <SimpleServerOverview />
      </div>
    </div>
  )
}
