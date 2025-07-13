"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Users, Server, Activity, Clock, Shield, MessageSquare, TrendingUp } from "lucide-react"

interface Stats {
  servers: number
  users: number
  commands: number
  uptime: string
  moderationActions: number
  messages: number
  growth: string
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        if (!supabase) {
          toast.error("Database connection failed")
          setLoading(false)
          return
        }

        // Fetch server count from guild_settings
        const { data: guilds, error: guildsError } = await supabase.from("guild_settings").select("guild_id")

        if (guildsError) {
          console.error("Error fetching guilds:", guildsError)
          toast.error("Failed to fetch server data")
        }

        // Fetch user count
        const { data: users, error: usersError } = await supabase.from("users").select("user_id")

        if (usersError) {
          console.error("Error fetching users:", usersError)
        }

        // Fetch command count
        const { data: commands, error: commandsError } = await supabase.from("commands").select("command_id")

        if (commandsError) {
          console.error("Error fetching commands:", commandsError)
        }

        // Fetch moderation actions count
        const { data: moderationActions, error: moderationError } = await supabase
          .from("moderation_logs")
          .select("log_id")

        if (moderationError) {
          console.error("Error fetching moderation actions:", moderationError)
        }

        // Calculate uptime (mock data for now)
        const uptimeHours = Math.floor(Math.random() * 720) + 24 // 1-30 days
        const uptimeDays = Math.floor(uptimeHours / 24)
        const remainingHours = uptimeHours % 24
        const uptimeString = `${uptimeDays}d ${remainingHours}h`

        // Mock message count (would come from bot analytics)
        const messageCount = Math.floor(Math.random() * 50000) + 10000

        // Mock growth percentage
        const growthPercentage = (Math.random() * 20 + 5).toFixed(1) // 5-25%

        setStats({
          servers: guilds?.length || 0,
          users: users?.length || 0,
          commands: commands?.length || 0,
          uptime: uptimeString,
          moderationActions: moderationActions?.length || 0,
          messages: messageCount,
          growth: `+${growthPercentage}%`,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast.error("Failed to load dashboard statistics")
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
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Active Servers",
      value: stats?.servers || 0,
      description: stats?.servers === 1 ? "server connected" : "servers connected",
      icon: Server,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: stats?.users || 0,
      description: "registered users",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Commands Available",
      value: stats?.commands || 0,
      description: "bot commands",
      icon: Activity,
      color: "text-purple-600",
    },
    {
      title: "Bot Uptime",
      value: stats?.uptime || "0h",
      description: "continuous operation",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Moderation Actions",
      value: stats?.moderationActions || 0,
      description: "total actions taken",
      icon: Shield,
      color: "text-red-600",
    },
    {
      title: "Messages Processed",
      value: stats?.messages || 0,
      description: "messages handled",
      icon: MessageSquare,
      color: "text-indigo-600",
    },
    {
      title: "Growth Rate",
      value: stats?.growth || "+0%",
      description: "this month",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
