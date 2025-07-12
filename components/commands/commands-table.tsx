"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Command } from "@/lib/types/database"
import { toast } from "sonner"

export function CommandsTable() {
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchCommands = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("commands").select("*").order("usage_count", { ascending: false })

      if (error) {
        console.error("Error fetching commands:", error)
        toast.error("Failed to fetch commands")
        return
      }

      setCommands(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} commands`)
      }
    } catch (error) {
      console.error("Error fetching commands:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCommands()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCommands()
  }

  const filteredCommands = commands.filter(
    (command) =>
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "moderation":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "utility":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "general":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "fun":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading commands...</p>
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
            <CardTitle className="text-white">Commands</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage bot commands, permissions, and usage statistics
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
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCommands.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No commands found matching your search." : "No commands found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Commands will appear here once they are registered in your database.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Command</TableHead>
                <TableHead className="text-emerald-200">Category</TableHead>
                <TableHead className="text-emerald-200">Usage Count</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200">Cooldown</TableHead>
                <TableHead className="text-emerald-200">Last Used</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommands.map((command) => (
                <TableRow key={command.name} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">/{command.name}</div>
                      <div className="text-sm text-emerald-200/70">{command.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(command.category)}>
                      {command.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-200/80">{command.usage_count.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        command.is_enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {command.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-200/80">{command.cooldown}s</TableCell>
                  <TableCell className="text-emerald-200/80">
                    {command.last_used ? new Date(command.last_used).toLocaleDateString() : "Never"}
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
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          {command.is_enabled ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
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
