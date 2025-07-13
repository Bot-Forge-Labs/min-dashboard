"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  Terminal,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Command } from "@/lib/types/database"
import { toast } from "sonner"

// Define subcommands based on your bot code with descriptions
const commandSubcommands: Record<string, Array<{ name: string; description: string }>> = {
  punish: [
    { name: "warning", description: "Issue a warning to a user" },
    { name: "ban", description: "Ban a user from the server" },
    { name: "mute", description: "Temporarily mute a user" },
  ],
  announcement: [{ name: "create", description: "Create a new announcement with embed" }],
  giveaway: [
    { name: "create", description: "Start a new giveaway" },
    { name: "delete", description: "Delete an existing giveaway" },
    { name: "view", description: "View giveaway details and participants" },
  ],
  reactionrole: [
    { name: "create", description: "Create a new reaction role message" },
    { name: "delete", description: "Remove an existing reaction role" },
    { name: "edit", description: "Modify reaction role settings" },
    { name: "view", description: "View reaction role configuration" },
    { name: "list", description: "List all reaction roles in the server" },
  ],
}

export function CommandsTable() {
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())

  const fetchCommands = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { data, error } = await supabase
        .from("commands")
        .select("*")
        .order("usage_count", { ascending: false })
        .limit(100)

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

  const toggleCommandExpansion = (commandName: string) => {
    const newExpanded = new Set(expandedCommands)
    if (newExpanded.has(commandName)) {
      newExpanded.delete(commandName)
    } else {
      newExpanded.add(commandName)
    }
    setExpandedCommands(newExpanded)
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "moderation":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "utility":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "fun":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "music":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const filteredCommands = commands.filter(
    (command) =>
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <CardTitle className="text-white">Bot Commands</CardTitle>
            <CardDescription className="text-emerald-200/80">
              View command usage statistics and manage bot commands
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
              <p className="text-sm text-emerald-300/40">Bot commands will appear here once they are registered.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCommands.map((command) => {
              const hasSubcommands = commandSubcommands[command.name]
              const isExpanded = expandedCommands.has(command.name)

              return (
                <Collapsible
                  key={command.name}
                  open={isExpanded}
                  onOpenChange={() => toggleCommandExpansion(command.name)}
                >
                  <div className="border border-emerald-400/20 rounded-lg bg-white/5">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {hasSubcommands ? (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-emerald-400" />
                                )}
                              </Button>
                            ) : (
                              <Terminal className="w-4 h-4 text-emerald-400/60 ml-2" />
                            )}
                            <div>
                              <div className="font-medium text-white">/{command.name}</div>
                              <div className="text-sm text-emerald-200/70">{command.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className={getCategoryColor(command.category)}>
                            {command.category}
                          </Badge>
                          <div className="text-emerald-200/80">{command.usage_count.toLocaleString()} uses</div>
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
                          <div className="text-emerald-200/80">{command.cooldown}s cooldown</div>
                          <div className="text-emerald-200/80">
                            {command.last_used ? new Date(command.last_used).toLocaleDateString() : "Never"}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white/10 backdrop-blur-xl border-emerald-400/20"
                          >
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
                      </div>
                    </CollapsibleTrigger>

                    {hasSubcommands && (
                      <CollapsibleContent>
                        <div className="border-t border-emerald-400/20 bg-white/5">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-emerald-200 mb-3">Subcommands:</h4>
                            <div className="space-y-2">
                              {commandSubcommands[command.name].map((subcommand) => (
                                <div
                                  key={subcommand.name}
                                  className="flex items-center justify-between p-3 rounded-md bg-white/5 border border-emerald-400/10"
                                >
                                  <div>
                                    <div className="font-medium text-white">
                                      /{command.name} {subcommand.name}
                                    </div>
                                    <div className="text-sm text-emerald-200/70">{subcommand.description}</div>
                                  </div>
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                    Subcommand
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
