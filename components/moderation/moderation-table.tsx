"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Filter,
  Ban,
  UserX,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { ModLog } from "@/lib/types/database"
import { toast } from "sonner"

export function ModerationTable() {
  const [modLogs, setModLogs] = useState<ModLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [guildFilter, setGuildFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [guilds, setGuilds] = useState<Array<{ id: string; name: string }>>([])

  const fetchModLogs = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      // Try the view first, fallback to regular table if view doesn't exist
      let { data, error } = await supabase
        .from("mod_logs_with_usernames")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      // If view doesn't exist, try the regular table
      if (error && error.message.includes("does not exist")) {
        const result = await supabase.from("mod_logs").select("*").order("created_at", { ascending: false }).limit(100)
        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Error fetching mod logs:", error)
        toast.error("Failed to fetch moderation logs")
        return
      }

      setModLogs(data || [])

      // Extract unique guilds for filter
      const uniqueGuilds = Array.from(new Set(data?.map((log) => log.guild_id) || [])).map((guildId) => ({
        id: guildId,
        name: `Guild ${guildId.slice(-4)}`,
      }))
      setGuilds(uniqueGuilds)

      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} moderation logs`)
      }
    } catch (error) {
      console.error("Error fetching mod logs:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchModLogs()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchModLogs()
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "kick":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "warn":
      case "warning":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "timeout":
      case "mute":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "unban":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "unmute":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "delete":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return <Ban className="w-3 h-3" />
      case "kick":
        return <UserX className="w-3 h-3" />
      case "warn":
      case "warning":
        return <AlertTriangle className="w-3 h-3" />
      case "timeout":
      case "mute":
        return <Clock className="w-3 h-3" />
      case "unban":
      case "unmute":
        return <CheckCircle className="w-3 h-3" />
      default:
        return <Shield className="w-3 h-3" />
    }
  }

  const filteredLogs = modLogs.filter((log) => {
    const matchesSearch =
      (log.user_username && log.user_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.moderator_username && log.moderator_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm) ||
      log.moderator_id.includes(searchTerm)

    const matchesAction = actionFilter === "all" || log.action.toLowerCase() === actionFilter.toLowerCase()
    const matchesGuild = guildFilter === "all" || log.guild_id === guildFilter

    return matchesSearch && matchesAction && matchesGuild
  })

  const parseDetails = (details: any) => {
    if (typeof details === "string") {
      try {
        return JSON.parse(details)
      } catch {
        return { reason: details }
      }
    }
    return details || {}
  }

  const formatDetails = (details: any) => {
    const parsed = parseDetails(details)

    if (!parsed || Object.keys(parsed).length === 0) {
      return "No details provided"
    }

    const formattedDetails = []

    if (parsed.reason || parsed.original_reason) {
      formattedDetails.push(`Reason: ${parsed.reason || parsed.original_reason}`)
    }

    if (parsed.duration) {
      formattedDetails.push(`Duration: ${parsed.duration}`)
    }

    if (parsed.expires_at) {
      formattedDetails.push(`Expires: ${new Date(parsed.expires_at).toLocaleString()}`)
    }

    if (parsed.channel_id) {
      formattedDetails.push(`Channel: #${parsed.channel_name || parsed.channel_id.slice(-4)}`)
    }

    if (parsed.message_id) {
      formattedDetails.push(`Message: ${parsed.message_id.slice(-8)}`)
    }

    Object.entries(parsed).forEach(([key, value]) => {
      if (
        !["reason", "original_reason", "duration", "expires_at", "channel_id", "message_id", "channel_name"].includes(
          key,
        )
      ) {
        formattedDetails.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${String(value)}`)
      }
    })

    return formattedDetails.length > 0 ? formattedDetails.join(" • ") : "No details provided"
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading moderation logs...</p>
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
            <CardTitle className="text-white">Moderation Logs</CardTitle>
            <CardDescription className="text-emerald-200/80">
              View all moderation actions taken across your servers
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
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-emerald-400/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-emerald-400/20">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="ban">Ban</SelectItem>
              <SelectItem value="kick">Kick</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="timeout">Timeout</SelectItem>
              <SelectItem value="mute">Mute</SelectItem>
              <SelectItem value="unban">Unban</SelectItem>
              <SelectItem value="unmute">Unmute</SelectItem>
            </SelectContent>
          </Select>
          <Select value={guildFilter} onValueChange={setGuildFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-emerald-400/20 text-white">
              <SelectValue placeholder="Guild" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-emerald-400/20">
              <SelectItem value="all">All Guilds</SelectItem>
              {guilds.map((guild) => (
                <SelectItem key={guild.id} value={guild.id}>
                  {guild.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm || actionFilter !== "all" || guildFilter !== "all"
                ? "No logs found matching your filters."
                : "No moderation logs found."}
            </p>
            {!searchTerm && actionFilter === "all" && guildFilter === "all" && (
              <p className="text-sm text-emerald-300/40">Moderation logs will appear here when actions are taken.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">User</TableHead>
                <TableHead className="text-emerald-200">Action</TableHead>
                <TableHead className="text-emerald-200">Moderator</TableHead>
                <TableHead className="text-emerald-200">Details</TableHead>
                <TableHead className="text-emerald-200">Guild</TableHead>
                <TableHead className="text-emerald-200">Time</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{log.user_username || "Unknown User"}</div>
                      <div className="text-xs text-emerald-300/60 font-mono">{log.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {getActionIcon(log.action)}
                      <span className="ml-1">{log.action}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-emerald-200">{log.moderator_username || "Unknown Moderator"}</div>
                      <div className="text-xs text-emerald-300/60 font-mono">{log.moderator_id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 max-w-md">
                    <div className="text-sm break-words">{formatDetails(log.details)}</div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {guilds.find((g) => g.id === log.guild_id)?.name || `Guild ${log.guild_id.slice(-4)}`}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    <div className="text-sm">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</div>
                    <div className="text-xs text-emerald-300/60">{new Date(log.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
