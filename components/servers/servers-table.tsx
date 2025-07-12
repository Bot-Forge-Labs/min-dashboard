"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Settings, Loader2, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Guild } from "@/lib/types/database"
import { toast } from "sonner"

export function ServersTable() {
  const [servers, setServers] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchServers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("guilds").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching servers:", error)
        toast.error("Failed to fetch servers")
        return
      }

      setServers(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} servers`)
      }
    } catch (error) {
      console.error("Error fetching servers:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchServers()
  }

  const filteredServers = servers.filter((server) => server.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "inactive":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading servers...</p>
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
            <CardTitle className="text-white">Servers</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage your Discord servers and their configurations
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
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredServers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No servers found matching your search." : "No servers found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Servers will appear here once your bot joins Discord servers.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Server Name</TableHead>
                <TableHead className="text-emerald-200">Guild ID</TableHead>
                <TableHead className="text-emerald-200">Owner ID</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServers.map((server) => (
                <TableRow key={server.guild_id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{server.name}</TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">{server.guild_id}</TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">{server.owner_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(server.status)}>
                      {server.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    {new Date(server.created_at).toLocaleDateString()}
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
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">Remove Bot</DropdownMenuItem>
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
