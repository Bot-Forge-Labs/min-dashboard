"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Server, Users, Activity, Zap, Gift, Shield, Megaphone } from "lucide-react"
import { getDashboardStats } from "@/lib/supabase/queries"
import type { DashboardStats } from "@/lib/types/database"

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 bg-emerald-400/20" />
              <Skeleton className="h-4 w-4 bg-emerald-400/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-emerald-400/20 mb-2" />
              <Skeleton className="h-3 w-24 bg-emerald-400/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Connected Servers",
      value: stats?.total_servers || 0,
      description: stats?.total_servers === 1 ? "active server" : "active servers",
      icon: Server,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      description: "registered users",
      icon: Users,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Bot Uptime",
      value: `${stats?.bot_uptime || 0}%`,
      description: "system availability",
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Commands/Day",
      value: stats?.commands_per_day || 0,
      description: "average usage",
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      title: "Active Giveaways",
      value: stats?.active_giveaways || 0,
      description: "running events",
      icon: Gift,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Mod Actions",
      value: stats?.mod_actions_week || 0,
      description: "this week",
      icon: Shield,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Announcements",
      value: stats?.announcements_month || 0,
      description: "this month",
      icon: Megaphone,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className={`bg-white/5 backdrop-blur-xl border ${stat.borderColor} shadow-xl`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200/80">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-emerald-300/60">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
