"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, User, Calendar, Loader2, RefreshCw } from "lucide-react"
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
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "kick":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "mute":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "warning":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "unban":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const filteredLogs = modLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm) ||
      log.moderator_id.includes(searchTerm) ||
      (log.user_username && log.user_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.moderator_username && log.moderator_username.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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
              Recent moderation actions and their details
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
              {searchTerm ? "No moderation logs found matching your search." : "No moderation logs found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Moderation actions will appear here once they are performed.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Action</TableHead>
                <TableHead className="text-emerald-200">User</TableHead>
                <TableHead className="text-emerald-200">Moderator</TableHead>
                <TableHead className="text-emerald-200">Details</TableHead>
                <TableHead className="text-emerald-200">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400/60" />
                      <div>
                        <p className="font-medium text-white">{log.user_username || "Unknown User"}</p>
                        <p className="text-xs text-emerald-200/60 font-mono">{log.user_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400/60" />
                      <div>
                        <p className="font-medium text-white">{log.moderator_username || "Unknown Moderator"}</p>
                        <p className="text-xs text-emerald-200/60 font-mono">{log.moderator_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {log.details && typeof log.details === "object" ? (
                        <div className="text-sm text-emerald-200/80">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-200/80">
                          {log.details ? String(log.details) : "No details"}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-emerald-200/80">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-emerald-200/60">{new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
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
