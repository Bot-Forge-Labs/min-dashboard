"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Eye, Loader2, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { Punishment } from "@/lib/types/database"
import { toast } from "sonner"

export function PunishmentsTable() {
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchPunishments = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { data, error } = await supabase
        .from("punishments")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("Error fetching punishments:", error)
        toast.error("Failed to fetch punishments")
        return
      }

      setPunishments(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} punishments`)
      }
    } catch (error) {
      console.error("Error fetching punishments:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPunishments()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPunishments()
  }

  const handleRevokePunishment = async (punishmentId: number) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("punishments").update({ active: false }).eq("id", punishmentId)

      if (error) {
        console.error("Error revoking punishment:", error)
        toast.error("Failed to revoke punishment")
        return
      }

      toast.success("Punishment revoked successfully")
      fetchPunishments() // Refresh the list
    } catch (error) {
      console.error("Error revoking punishment:", error)
      toast.error("Failed to revoke punishment")
    }
  }

  const filteredPunishments = punishments.filter(
    (punishment) =>
      punishment.user_id.includes(searchTerm) ||
      punishment.command_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      punishment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      punishment.moderator_id.includes(searchTerm),
  )

  const getCommandColor = (command: string) => {
    switch (command.toLowerCase()) {
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
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading punishments...</p>
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
            <CardTitle className="text-white">Active Punishments</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage active punishments and their expiration
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
              placeholder="Search punishments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPunishments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No punishments found matching your search." : "No punishments found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">Punishments will appear here when users are moderated.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">User ID</TableHead>
                <TableHead className="text-emerald-200">Type</TableHead>
                <TableHead className="text-emerald-200">Reason</TableHead>
                <TableHead className="text-emerald-200">Moderator</TableHead>
                <TableHead className="text-emerald-200">Issued</TableHead>
                <TableHead className="text-emerald-200">Expires</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPunishments.map((punishment) => {
                const expired = isExpired(punishment.expires_at)
                const actuallyActive = punishment.active && !expired

                return (
                  <TableRow key={punishment.id} className="border-emerald-400/20 hover:bg-white/5">
                    <TableCell className="font-mono text-white">{punishment.user_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCommandColor(punishment.command_name)}>
                        {punishment.command_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-emerald-200/80 max-w-xs truncate">{punishment.reason}</TableCell>
                    <TableCell className="text-emerald-200/80 font-mono text-sm">{punishment.moderator_id}</TableCell>
                    <TableCell className="text-emerald-200/80">
                      {formatDistanceToNow(new Date(punishment.issued_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-emerald-200/80">
                      {punishment.expires_at
                        ? formatDistanceToNow(new Date(punishment.expires_at), { addSuffix: true })
                        : "Permanent"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          actuallyActive
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }
                      >
                        {actuallyActive ? "Active" : expired ? "Expired" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {actuallyActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => handleRevokePunishment(punishment.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
