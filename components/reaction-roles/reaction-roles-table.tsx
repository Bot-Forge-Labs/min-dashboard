"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { ReactionRole } from "@/lib/types/database"
import { toast } from "sonner"

export function ReactionRolesTable() {
  const [reactionRoles, setReactionRoles] = useState<ReactionRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchReactionRoles = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { data, error } = await supabase
        .from("reaction_roles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reaction roles:", error)
        toast.error("Failed to fetch reaction roles")
        return
      }

      setReactionRoles(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} reaction roles`)
      }
    } catch (error) {
      console.error("Error fetching reaction roles:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReactionRoles()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchReactionRoles()
  }

  const handleDeleteReactionRole = async (reactionRoleId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("reaction_roles").delete().eq("id", reactionRoleId)

      if (error) {
        console.error("Error deleting reaction role:", error)
        toast.error("Failed to delete reaction role")
        return
      }

      toast.success("Reaction role deleted successfully")
      fetchReactionRoles() // Refresh the list
    } catch (error) {
      console.error("Error deleting reaction role:", error)
      toast.error("Failed to delete reaction role")
    }
  }

  const filteredReactionRoles = reactionRoles.filter(
    (role) =>
      role.emoji.includes(searchTerm) ||
      role.role_id.includes(searchTerm) ||
      role.guild_id.includes(searchTerm) ||
      role.message_id.includes(searchTerm),
  )

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading reaction roles...</p>
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
            <CardTitle className="text-white">Reaction Roles</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage reaction role assignments and embeds
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
              placeholder="Search reaction roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReactionRoles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No reaction roles found matching your search." : "No reaction roles found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">Reaction roles will appear here when they are created.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Emoji</TableHead>
                <TableHead className="text-emerald-200">Role ID</TableHead>
                <TableHead className="text-emerald-200">Message ID</TableHead>
                <TableHead className="text-emerald-200">Channel ID</TableHead>
                <TableHead className="text-emerald-200">Guild ID</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReactionRoles.map((role) => (
                <TableRow key={role.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell className="text-2xl">{role.emoji}</TableCell>
                  <TableCell className="font-mono text-emerald-200/80">{role.role_id}</TableCell>
                  <TableCell className="font-mono text-emerald-200/80">{role.message_id}</TableCell>
                  <TableCell className="font-mono text-emerald-200/80">{role.channel_id}</TableCell>
                  <TableCell className="font-mono text-emerald-200/80">{role.guild_id}</TableCell>
                  <TableCell className="text-emerald-200/80">
                    {formatDistanceToNow(new Date(role.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteReactionRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
