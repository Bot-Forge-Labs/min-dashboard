import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Users, Zap, Award } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-emerald-200/60">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,350</div>
            <p className="text-xs text-emerald-200/60">+180 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Commands Used</CardTitle>
            <Zap className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12,234</div>
            <p className="text-xs text-emerald-200/60">+19% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">XP Given</CardTitle>
            <Award className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">573,000</div>
            <p className="text-xs text-emerald-200/60">+201 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="text-emerald-200/60">Activity chart would go here</div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-emerald-200/60">Manage your bot settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-emerald-200/60">Quick action buttons would go here</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
