"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { ModLog } from "@/lib/types/database"
import { toast } from "sonner"

export function ModerationTable() {
  const [modLogs, setModLogs] = useState<ModLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchModLogs = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      // Try to fetch from the view first, fallback to regular table
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

  const filteredLogs = modLogs.filter(
    (log) =>
      (log.user_username && log.user_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.moderator_username && log.moderator_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm) ||
      log.moderator_id.includes(searchTerm),
  )

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "kick":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "warn":
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "timeout":
      case "mute":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "unban":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

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
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No logs found matching your search." : "No moderation logs found."}
            </p>
            {!searchTerm && (
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
                <TableHead className="text-emerald-200">Reason</TableHead>
                <TableHead className="text-emerald-200">Guild</TableHead>
                <TableHead className="text-emerald-200">Time</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const details = parseDetails(log.details)
                return (
                  <TableRow key={log.id} className="border-emerald-400/20 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{log.user_username || "Unknown User"}</div>
                        <div className="text-xs text-emerald-300/60 font-mono">{log.user_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-emerald-200">{log.moderator_username || "Unknown Moderator"}</div>
                        <div className="text-xs text-emerald-300/60 font-mono">{log.moderator_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-emerald-200/80 max-w-xs">
                      <div className="truncate">
                        {details.reason || details.original_reason || "No reason provided"}
                      </div>
                      {details.duration && (
                        <div className="text-xs text-emerald-300/60">Duration: {details.duration}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-200/80 font-mono text-sm">{log.guild_id}</TableCell>
                    <TableCell className="text-emerald-200/80">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
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
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
