import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bot, Server, Users } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase/queries"

export async function StatsCards() {
  const stats = await getDashboardStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">Total Servers</CardTitle>
          <Server className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.total_servers}</div>
          <p className="text-xs text-emerald-300/60">
            {stats.total_servers === 0 ? "Configure Supabase to see data" : "Active servers"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">Total Users</CardTitle>
          <Users className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.total_users.toLocaleString()}</div>
          <p className="text-xs text-emerald-300/60">
            {stats.total_users === 0 ? "Configure Supabase to see data" : "Registered users"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">Bot Uptime</CardTitle>
          <Activity className="h-4 w-4 text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.bot_uptime === 0 ? "--" : `${stats.bot_uptime}%`}</div>
          <p className="text-xs text-emerald-300/60">
            {stats.bot_uptime === 0 ? "Configure Supabase to see data" : "Last 30 days"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl hover:bg-white/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">Commands/Day</CardTitle>
          <Bot className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.commands_per_day.toLocaleString()}</div>
          <p className="text-xs text-emerald-300/60">
            {stats.commands_per_day === 0 ? "Configure Supabase to see data" : "Today's usage"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
