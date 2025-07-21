"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCw, Search, TrendingUp, Award, Users, Zap, Plus, Minus, Settings, Crown, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { UserLevel, LevelingStats } from "../../types/leveling"
import { toast } from "sonner"

interface LevelingSystemPanelProps {
  guildId: string
}

export function LevelingSystemPanel({ guildId }: LevelingSystemPanelProps) {
  const [users, setUsers] = useState<UserLevel[]>([])
  const [stats, setStats] = useState<LevelingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserLevel | null>(null)
  const [xpAmount, setXpAmount] = useState<number>(0)
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false)

  const fetchLevelingData = async () => {
    try {
      setLoading(true)

      // Fetch user levels
      const usersResponse = await fetch(`/api/leveling/users?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch user levels")
      }

      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])

      // Fetch stats
      const statsResponse = await fetch(`/api/leveling/stats?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      toast.success(`Loaded ${usersData.users?.length || 0} user levels`)
    } catch (error) {
      console.error("Error fetching leveling data:", error)
      toast.error("Failed to fetch leveling data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLevelingData()
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

  const handleXpModification = async (add: boolean) => {
    if (!selectedUser || xpAmount === 0) return

    try {
      const response = await fetch("/api/leveling/modify-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
        body: JSON.stringify({
          guild_id: guildId,
          user_id: selectedUser.user_id,
          xp_change: add ? xpAmount : -xpAmount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to modify XP")
      }

      toast.success(`${add ? "Added" : "Removed"} ${xpAmount} XP ${add ? "to" : "from"} ${selectedUser.username}`)
      setIsXpDialogOpen(false)
      setXpAmount(0)
      setSelectedUser(null)
      fetchLevelingData()
    } catch (error) {
      console.error("Error modifying XP:", error)
      toast.error("Failed to modify XP")
    }
  }

  useEffect(() => {
    if (guildId) {
      fetchLevelingData()
    }
  }, [guildId])

  const filteredUsers = users.filter(
    (user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.user_id.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total_users.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Average Level</p>
                  <p className="text-2xl font-bold text-white">{stats.average_level.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Highest Level</p>
                  <p className="text-2xl font-bold text-white">{stats.highest_level}</p>
                </div>
                <Crown className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Total XP Given</p>
                  <p className="text-2xl font-bold text-white">{stats.total_xp_given.toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Leveling Table */}
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5" />
                Leveling System
              </CardTitle>
              <CardDescription className="text-emerald-200/80">
                Manage user levels and XP for your server ({filteredUsers.length} users)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium text-emerald-200 mb-2">No users found</h3>
              <p className="text-emerald-200/60">
                {searchTerm ? "No users match your search." : "No users have gained XP yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-emerald-400/20 hover:bg-white/5">
                  <TableHead className="text-emerald-200">Rank</TableHead>
                  <TableHead className="text-emerald-200">User</TableHead>
                  <TableHead className="text-emerald-200">Level</TableHead>
                  <TableHead className="text-emerald-200">XP Progress</TableHead>
                  <TableHead className="text-emerald-200">Total XP</TableHead>
                  <TableHead className="text-emerald-200 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers
                  .sort((a, b) => b.total_xp - a.total_xp)
                  .map((user, index) => {
                    const currentLevelXp = calculateCurrentLevelXp(user.total_xp, user.level)
                    const xpForNextLevel = calculateXpForNextLevel(user.level)
                    const progressPercentage = (currentLevelXp / xpForNextLevel) * 100

                    return (
                      <TableRow key={user.id} className="border-emerald-400/20 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                            {index === 1 && <Star className="w-4 h-4 text-gray-300" />}
                            {index === 2 && <Star className="w-4 h-4 text-amber-600" />}
                            <span className="text-white font-medium">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
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
                            <div>
                              <p className="font-medium text-white">{user.username}</p>
                              <p className="text-sm text-emerald-200/60">#{user.discriminator}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/20">
                            Level {user.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-200/80">
                                {currentLevelXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                              </span>
                              <span className="text-emerald-200/60">{progressPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2 bg-emerald-900/20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-mono">{user.total_xp.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsXpDialogOpen(true)
                            }}
                            className="text-emerald-200 hover:text-emerald-100 hover:bg-emerald-500/10"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Modify XP
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* XP Modification Dialog */}
      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="bg-gray-900 border-emerald-400/20">
          <DialogHeader>
            <DialogTitle className="text-white">Modify XP for {selectedUser?.username}</DialogTitle>
            <DialogDescription className="text-emerald-200/80">
              Add or remove XP from this user. Level will be automatically recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="xp-amount" className="text-emerald-200">
                XP Amount
              </Label>
              <Input
                id="xp-amount"
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Number.parseInt(e.target.value) || 0)}
                placeholder="Enter XP amount..."
                className="bg-white/5 border-emerald-400/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsXpDialogOpen(false)}
              className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleXpModification(false)}
              disabled={xpAmount <= 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Minus className="w-4 h-4 mr-2" />
              Remove XP
            </Button>
            <Button
              onClick={() => handleXpModification(true)}
              disabled={xpAmount <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add XP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
