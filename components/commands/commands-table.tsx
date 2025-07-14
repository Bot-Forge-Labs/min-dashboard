"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  BarChart3,
  Loader2,
  RefreshCw,
  Filter,
  Command,
  Zap,
  Users,
  Music,
  Shield,
  GamepadIcon,
  Wrench,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Command as CommandType } from "@/types/database"
import { toast } from "sonner"

interface CommandWithSubcommands extends CommandType {
  subcommands?: Array<{
    name: string
    description: string
    usage_count: number
    is_enabled: boolean
  }>
}

export function CommandsTable() {
  const [commands, setCommands] = useState<CommandWithSubcommands[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCommands()
  }, [])

  const fetchCommands = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const { data, error } = await supabase
        .from("commands")
        .select("*")
        .order("usage_count", { ascending: false })

      if (error) {
        console.error("Error fetching commands:", error)
        toast.error("Failed to fetch commands")
        return
      }

      // Group commands with their subcommands
      const commandsWithSubs = (data || []).reduce((acc: CommandWithSubcommands[], cmd) => {
        if (cmd.parent_command) {
          // This is a subcommand
          const parent = acc.find((c) => c.name === cmd.parent_command)
          if (parent) {
            if (!parent.subcommands) parent.subcommands = []
            parent.subcommands.push({
              name: cmd.name,
              description: cmd.description,
              usage_count: cmd.usage_count ?? 0,
              is_enabled: cmd.is_enabled ?? true,
            })
          }
        } else {
          // This is a main command
          acc.push({
            ...cmd,
            subcommands: [],
          })
        }
        return acc
      }, [])

      setCommands(commandsWithSubs)
      if (commandsWithSubs.length > 0) {
        toast.success(`Loaded ${commandsWithSubs.length} commands`)
      }
    } catch (error) {
      console.error("Error fetching commands:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCommands()
  }

  const toggleCommand = async (commandName: string, enabled: boolean) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      // Use is_enabled here
      const { error } = await supabase.from("commands").update({ is_enabled: enabled }).eq("name", commandName)

      if (error) {
        console.error("Error updating command:", error)
        toast.error("Failed to update command")
        return
      }

      // Update local state with is_enabled
      setCommands((prev) =>
        prev.map((cmd) => (cmd.name === commandName ? { ...cmd, is_enabled: enabled } : cmd)),
      )

      toast.success(`${commandName} ${enabled ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error updating command:", error)
      toast.error("Failed to update command")
    }
  }

  const toggleSubcommand = async (parentCommand: string, subcommandName: string, enabled: boolean) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      // Use is_enabled here
      const { error } = await supabase
        .from("commands")
        .update({ is_enabled: enabled })
        .eq("name", subcommandName)
        .eq("parent_command", parentCommand)

      if (error) {
        console.error("Error updating subcommand:", error)
        toast.error("Failed to update subcommand")
        return
      }

      // Update local state with is_enabled
      setCommands((prev) =>
        prev.map((cmd) => {
          if (cmd.name === parentCommand && cmd.subcommands) {
            return {
              ...cmd,
              subcommands: cmd.subcommands.map((sub) =>
                sub.name === subcommandName ? { ...sub, is_enabled: enabled } : sub,
              ),
            }
          }
          return cmd
        }),
      )

      toast.success(`${subcommandName} ${enabled ? "enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error updating subcommand:", error)
      toast.error("Failed to update subcommand")
    }
  }

  const toggleExpanded = (commandName: string) => {
    setExpandedCommands((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commandName)) {
        newSet.delete(commandName)
      } else {
        newSet.add(commandName)
      }
      return newSet
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "moderation":
        return <Shield className="w-4 h-4" />
      case "music":
        return <Music className="w-4 h-4" />
      case "utility":
        return <Wrench className="w-4 h-4" />
      case "fun":
        return <GamepadIcon className="w-4 h-4" />
      case "social":
        return <Users className="w-4 h-4" />
      case "admin":
        return <Settings className="w-4 h-4" />
      default:
        return <Command className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "moderation":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "music":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "utility":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "fun":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "social":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "admin":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const filteredCommands = commands.filter((command) => {
    const matchesSearch =
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.subcommands?.some(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    const matchesCategory = categoryFilter === "all" || command.category === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && command.is_enabled) ||
      (statusFilter === "disabled" && !command.is_enabled)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = Array.from(new Set(commands.map((cmd) => cmd.category))).filter(Boolean)

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
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
            <CardTitle className="text-white flex items-center gap-2">
              <Command className="w-5 h-5" />
              Bot Commands
            </CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage and configure bot commands and their usage
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-emerald-400/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-emerald-400/20">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category ?? ""}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white/5 border-emerald-400/20 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-emerald-400/20">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCommands.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "No commands found matching your filters."
                : "No commands found."}
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommands.map((command) => (
              <Card key={command.name} className="bg-white/10 border border-emerald-400/20 shadow-md">
                <CardHeader className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <Badge className={`flex items-center gap-1 ${getCategoryColor(command.category || "")}`}>
                      {getCategoryIcon(command.category || "")}
                      {command.category || "Uncategorized"}
                    </Badge>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{command.name}</h3>
                      <p className="text-emerald-200/80 text-sm max-w-xl">{command.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={command.is_enabled ?? false}
                      onCheckedChange={(checked) => toggleCommand(command.name, checked)}
                      className="border-emerald-400/40"
                    />
                    {command.subcommands && command.subcommands.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(command.name)}
                        aria-label={expandedCommands.has(command.name) ? "Collapse subcommands" : "Expand subcommands"}
                        className="text-emerald-300 hover:text-emerald-400"
                      >
                        {expandedCommands.has(command.name) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {expandedCommands.has(command.name) && command.subcommands && (
                  <CollapsibleContent className="bg-white/5 border-t border-emerald-400/20 p-4">
                    <div className="space-y-3">
                      {command.subcommands.map((sub) => (
                        <div
                          key={sub.name}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-white/10"
                        >
                          <div>
                            <h4 className="text-emerald-200 font-semibold">{sub.name}</h4>
                            <p className="text-emerald-200/80 text-sm">{sub.description}</p>
                          </div>
                          <Switch
                            checked={sub.is_enabled}
                            onCheckedChange={(checked) => toggleSubcommand(command.name, sub.name, checked)}
                            className="border-emerald-400/40"
                          />
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
