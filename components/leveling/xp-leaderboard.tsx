"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, Crown, Star, TrendingUp, RefreshCw, Search, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { UserLevel } from "@/types/leveling"
import { toast } from "sonner"

interface XPLeaderboardProps {
  guildId: string
}

export function XPLeaderboard({ guildId }: XPLeaderboardProps) {
  const [users, setUsers] = useState<UserLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [timeframe, setTimeframe] = useState("all-time")
  const [sortBy, setSortBy] = useState("total_xp")

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/leveling/leaderboard?guild_id=${guildId}&timeframe=${timeframe}&sort_by=${sortBy}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard")
      }

      const data = await response.json()
      setUsers(data.users || [])
      toast.success(`Loaded ${data.users?.length || 0} users`)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      toast.error("Failed to fetch leaderboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLeaderboard()
  }

  const calculateXpForNextLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level))
  }

  const calculateCurrentLevelXp = (totalXp: number, level: number): number => {
    let xpForPreviousLevels = 0
    for (let i = 0; i < level; i++) {
      xpForPreviousLevels += calculateXpForNextLevel(i)
    }
    return totalXp - xpForPreviousLevels
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <Star className="w-5 h-5 text-emerald-400" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-200 border-yellow-400/20"
    if (rank <= 10) return "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-400/20"
    return "bg-white/10 text-white border-white/20"
  }

  useEffect(() => {
    if (guildId) {
      fetchLeaderboard()
    }
  }, [guildId, timeframe, sortBy])

  const filteredUsers = users.filter(
    (user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.user_id.includes(searchTerm),
  )

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              XP Leaderboard
            </CardTitle>
            <CardDescription className="text-emerald-200/80">
              Top performers in your server ({filteredUsers.length} users)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white w-full sm:w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-emerald-400/20">
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="daily">Today</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white w-full sm:w-48">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-emerald-400/20">
              <SelectItem value="total_xp">Total XP</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="recent_activity">Recent Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium text-emerald-200 mb-2">No users found</h3>
            <p className="text-emerald-200/60">
              {searchTerm ? "No users match your search." : "No users have gained XP yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => {
              const rank = index + 1
              const currentLevelXp = calculateCurrentLevelXp(user.total_xp, user.level)
              const xpForNextLevel = calculateXpForNextLevel(user.level)
              const progressPercentage = (currentLevelXp / xpForNextLevel) * 100

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-white/5 ${
                    rank <= 3
                      ? "bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border-yellow-400/20"
                      : "border-emerald-400/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(rank)}</div>
                    <Badge className={getRankBadgeColor(rank)}>#{rank}</Badge>
                  </div>

                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        user.avatar
                          ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png`
                          : undefined
                      }
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-200">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{user.username}</h3>
                      <span className="text-emerald-200/60 text-sm">#{user.discriminator}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/20">
                        Level {user.level}
                      </Badge>
                      <span className="text-emerald-200/80">{user.total_xp.toLocaleString()} total XP</span>
                    </div>
                  </div>

                  <div className="text-right min-w-0 flex-shrink-0">
                    <div className="text-sm text-emerald-200/80 mb-1">
                      {currentLevelXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </div>
                    <div className="w-32">
                      <Progress value={progressPercentage} className="h-2 bg-emerald-900/20" />
                    </div>
                    <div className="text-xs text-emerald-200/60 mt-1">
                      {progressPercentage.toFixed(1)}% to next level
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
