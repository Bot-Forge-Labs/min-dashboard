"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Shield, AlertTriangle, Ban, UserX, Clock, Plus, Search } from "lucide-react"

interface ModerationAction {
  id: number
  guild_id: string
  user_id: string
  user_username?: string
  moderator_id: string
  moderator_username?: string
  action: string
  reason: string
  duration?: string
  expires_at?: string
  created_at: string
}

interface Guild {
  guild_id: string
  name: string
}

interface User {
  id: string
  username: string
}

export function ModerationPanel() {
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [showPunishDialog, setShowPunishDialog] = useState(false)
  const [punishing, setPunishing] = useState(false)

  const [punishmentForm, setPunishmentForm] = useState({
    userId: "",
    action: "",
    reason: "",
    duration: "",
    guildId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      // Fetch moderation actions
      const { data: actionsData, error: actionsError } = await supabase
        .from("mod_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (actionsError) {
        console.error("Error fetching moderation actions:", actionsError)
      } else {
        setActions(actionsData || [])
      }

      // Fetch guilds
      const { data: guildsData, error: guildsError } = await supabase
        .from("guild_settings")
        .select("guild_id, guild_name")

      if (guildsError) {
        console.error("Error fetching guilds:", guildsError)
      } else {
        setGuilds(guildsData || [])
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase.from("users").select("id, username").limit(100)

      if (usersError) {
        console.error("Error fetching users:", usersError)
      } else {
        setUsers(usersData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load moderation data")
    } finally {
      setLoading(false)
    }
  }

  const handlePunishment = async () => {
    if (!punishmentForm.userId || !punishmentForm.action || !punishmentForm.reason || !punishmentForm.guildId) {
      toast.error("Please fill in all required fields")
      return
    }

    setPunishing(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      // Calculate expiration time if duration is provided
      let expiresAt = null
      if (punishmentForm.duration && (punishmentForm.action === "mute" || punishmentForm.action === "timeout")) {
        const durationMinutes = Number.parseInt(punishmentForm.duration)
        if (!isNaN(durationMinutes)) {
          expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
        }
      }

      // Insert moderation log
      const { error: logError } = await supabase.from("mod_logs").insert({
        guild_id: punishmentForm.guildId,
        user_id: punishmentForm.userId,
        moderator_id: "dashboard_user", // You might want to get this from auth
        action: punishmentForm.action,
        details: {
          reason: punishmentForm.reason,
          duration: punishmentForm.duration,
          expires_at: expiresAt,
        },
      })

      if (logError) {
        console.error("Error creating moderation log:", logError)
        toast.error("Failed to create moderation log")
        return
      }

      // Insert punishment record if applicable
      if (["ban", "mute", "timeout"].includes(punishmentForm.action)) {
        const { error: punishmentError } = await supabase.from("punishments").insert({
          user_id: punishmentForm.userId,
          moderator_id: "dashboard_user",
          command_name: punishmentForm.action,
          reason: punishmentForm.reason,
          expires_at: expiresAt,
          active: true,
        })

        if (punishmentError) {
          console.error("Error creating punishment record:", punishmentError)
          // Don't return here, as the log was created successfully
        }
      }

      toast.success(`${punishmentForm.action} applied successfully`)
      setShowPunishDialog(false)
      setPunishmentForm({
        userId: "",
        action: "",
        reason: "",
        duration: "",
        guildId: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error applying punishment:", error)
      toast.error("Failed to apply punishment")
    } finally {
      setPunishing(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return <Ban className="w-4 h-4" />
      case "kick":
        return <UserX className="w-4 h-4" />
      case "warn":
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "mute":
      case "timeout":
        return <Clock className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "kick":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "warn":
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "mute":
      case "timeout":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const filteredActions = actions.filter(
    (action) =>
      action.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.moderator_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Moderation Panel</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Manage user punishments and view moderation history
              </CardDescription>
            </div>
            <Dialog open={showPunishDialog} onOpenChange={setShowPunishDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Punish User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Apply Punishment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guild-select" className="text-emerald-200">
                      Guild
                    </Label>
                    <Select
                      value={punishmentForm.guildId}
                      onValueChange={(value) => setPunishmentForm({ ...punishmentForm, guildId: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white">
                        <SelectValue placeholder="Select guild" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-emerald-400/20">
                        {guilds.map((guild) => (
                          <SelectItem key={guild.guild_id} value={guild.guild_id} className="text-white">
                            {guild.name || guild.guild_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="user-select" className="text-emerald-200">
                      User
                    </Label>
                    <Select
                      value={punishmentForm.userId}
                      onValueChange={(value) => setPunishmentForm({ ...punishmentForm, userId: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-emerald-400/20">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="text-white">
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="action-select" className="text-emerald-200">
                      Action
                    </Label>
                    <Select
                      value={punishmentForm.action}
                      onValueChange={(value) => setPunishmentForm({ ...punishmentForm, action: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-emerald-400/20">
                        <SelectItem value="warn" className="text-white">
                          Warning
                        </SelectItem>
                        <SelectItem value="mute" className="text-white">
                          Mute
                        </SelectItem>
                        <SelectItem value="timeout" className="text-white">
                          Timeout
                        </SelectItem>
                        <SelectItem value="kick" className="text-white">
                          Kick
                        </SelectItem>
                        <SelectItem value="ban" className="text-white">
                          Ban
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason" className="text-emerald-200">
                      Reason
                    </Label>
                    <Textarea
                      id="reason"
                      value={punishmentForm.reason}
                      onChange={(e) => setPunishmentForm({ ...punishmentForm, reason: e.target.value })}
                      placeholder="Enter reason for punishment"
                      className="bg-white/5 border-emerald-400/20 text-white"
                    />
                  </div>
                  {(punishmentForm.action === "mute" || punishmentForm.action === "timeout") && (
                    <div>
                      <Label htmlFor="duration" className="text-emerald-200">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={punishmentForm.duration}
                        onChange={(e) => setPunishmentForm({ ...punishmentForm, duration: e.target.value })}
                        placeholder="Enter duration in minutes"
                        className="bg-white/5 border-emerald-400/20 text-white"
                      />
                    </div>
                  )}
                  <Button
                    onClick={handlePunishment}
                    disabled={punishing}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                  >
                    {punishing ? "Applying..." : "Apply Punishment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="bg-white/5 border-emerald-400/20">
          <TabsTrigger value="logs" className="data-[state=active]:bg-emerald-500/20">
            Moderation Logs
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500/20">
            Active Punishments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
                  <Input
                    placeholder="Search moderation logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
                  />
                </div>
                <Select value={selectedGuild} onValueChange={setSelectedGuild}>
                  <SelectTrigger className="w-48 bg-white/5 border-emerald-400/20 text-white">
                    <SelectValue placeholder="Filter by guild" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-emerald-400/20">
                    <SelectItem value="" className="text-white">
                      All Guilds
                    </SelectItem>
                    {guilds.map((guild) => (
                      <SelectItem key={guild.guild_id} value={guild.guild_id} className="text-white">
                        {guild.name || guild.guild_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 border border-emerald-400/20 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getActionColor(action.action)}>
                        {getActionIcon(action.action)}
                        <span className="ml-1">{action.action}</span>
                      </Badge>
                      <div>
                        <div className="text-white font-medium">{action.user_username || action.user_id}</div>
                        <div className="text-emerald-200/70 text-sm">
                          by {action.moderator_username || action.moderator_id}
                        </div>
                      </div>
                      <div className="text-emerald-200/80 text-sm max-w-md">{action.reason}</div>
                    </div>
                    <div className="text-emerald-200/60 text-sm">{new Date(action.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {filteredActions.length === 0 && (
                  <div className="text-center py-8 text-emerald-200/60">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No moderation logs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Active Punishments</CardTitle>
              <CardDescription className="text-emerald-200/80">
                View and manage currently active punishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-emerald-200/60">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Active punishments will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
