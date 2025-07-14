"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Command as CommandType } from "@/types/database";
import { toast } from "sonner";

interface CommandWithSubcommands extends CommandType {
  subcommands?: Array<{
    name: string
    description: string
    usage_count: number
    is_enabled: boolean
  }
}

export function CommandsTable() {
  const [commands, setCommands] = useState<CommandWithSubcommands[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Database connection failed");
        return;
      }

      const { data, error } = await supabase
        .from("commands")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) {
        console.error("Error fetching commands:", error);
        toast.error("Failed to fetch commands");
        return;
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
              usage_count: cmd.usage_count,
              is_enabled: cmd.is_enabled,
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

      setCommands(commandsWithSubs);
      if (commandsWithSubs.length > 0) {
        toast.success(`Loaded ${commandsWithSubs.length} commands`);
      }
    } catch (error) {
      console.error("Error fetching commands:", error);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommands();
  };

  const toggleCommand = async (commandName: string, is_enabled: boolean) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Database connection failed");
        return;
      }

      const { error } = await supabase.from("commands").update({ is_enabled }).eq("name", commandName)

      if (error) {
        console.error("Error updating command:", error);
        toast.error("Failed to update command");
        return;
      }

      setCommands((prev) => prev.map((cmd) => (cmd.name === commandName ? { ...cmd, is_enabled } : cmd)))

      toast.success(`${commandName} ${is_enabled ? "is_enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error updating command:", error);
      toast.error("Failed to update command");
    }
  };

  const toggleSubcommand = async (parentCommand: string, subcommandName: string, is_enabled: boolean) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Database connection failed");
        return;
      }

      // Since parent_command doesn't exist in schema, just update by name
      const { error } = await supabase
        .from("commands")
        .update({ is_enabled })
        .eq("name", subcommandName)
        .eq("parent_command", parentCommand)

      if (error) {
        console.error("Error updating subcommand:", error);
        toast.error("Failed to update subcommand");
        return;
      }

      // Update local state
      setCommands((prev) =>
        prev.map((cmd) => {
          if (cmd.name === parentCommand && cmd.subcommands) {
            return {
              ...cmd,
              subcommands: cmd.subcommands.map((sub) => (sub.name === subcommandName ? { ...sub, is_enabled } : sub)),
            }
          }
          return cmd;
        })
      );

      toast.success(`${subcommandName} ${is_enabled ? "is_enabled" : "disabled"}`)
    } catch (error) {
      console.error("Error updating subcommand:", error);
      toast.error("Failed to update subcommand");
    }
  };

  const toggleExpanded = (commandName: string) => {
    setExpandedCommands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commandName)) {
        newSet.delete(commandName);
      } else {
        newSet.add(commandName);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "moderation":
        return <Shield className="w-4 h-4" />;
      case "music":
        return <Music className="w-4 h-4" />;
      case "utility":
        return <Wrench className="w-4 h-4" />;
      case "fun":
        return <GamepadIcon className="w-4 h-4" />;
      case "social":
        return <Users className="w-4 h-4" />;
      case "admin":
        return <Settings className="w-4 h-4" />;
      default:
        return <Command className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "moderation":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "music":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "utility":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "fun":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "social":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "admin":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const filteredCommands = commands.filter((command) => {
    const matchesSearch =
      command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.subcommands?.some(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" || command.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "is_enabled" && command.is_enabled) ||
      (statusFilter === "disabled" && !command.is_enabled)

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(
    new Set(commands.map((cmd) => cmd.category).filter(Boolean))
  ) as string[];

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
    );
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
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
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
                <SelectItem key={category} value={category}>
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
              <SelectItem value="is_enabled">is_enabled</SelectItem>
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
            {!searchTerm &&
              categoryFilter === "all" &&
              statusFilter === "all" && (
                <p className="text-sm text-emerald-300/40">
                  Commands will appear here once they're registered.
                </p>
              )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCommands.map((command) => (
              <Collapsible
                key={command.name}
                open={expandedCommands.has(command.name)}
                onOpenChange={() => toggleExpanded(command.name)}
              >
                <div className="border border-emerald-400/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {command.subcommands &&
                          command.subcommands.length > 0 ? (
                            expandedCommands.has(command.name) ? (
                              <ChevronDown className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-emerald-400" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                          {getCategoryIcon(command.category || "default")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              /{command.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={getCategoryColor(
                                command.category || "default"
                              )}
                            >
                              {command.category || "Unknown"}
                            </Badge>
                            {command.subcommands &&
                              command.subcommands.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                >
                                  {command.subcommands.length} subcommands
                                </Badge>
                              )}
                          </div>
                          <p className="text-sm text-emerald-200/80 mt-1">
                            {command.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-emerald-300">
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-medium">
                              {(command.usage_count || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-300/60">uses</p>
                        </div>
                        <Switch
                          checked={command.is_enabled}
                          onCheckedChange={(checked) => toggleCommand(command.name, checked)}
                          className="data-[state=checked]:bg-emerald-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {command.subcommands && command.subcommands.length > 0 && (
                    <CollapsibleContent>
                      <div className="border-t border-emerald-400/20 bg-white/5">
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-emerald-200 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Subcommands
                          </h4>
                          <div className="space-y-2">
                            {command.subcommands.map((subcommand) => (
                              <div
                                key={subcommand.name}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-emerald-400/10"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                                  <div>
                                    <div className="font-medium text-white">
                                      /{command.name} {subcommand.name}
                                    </div>
                                    <p className="text-sm text-emerald-200/70">
                                      {subcommand.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm text-emerald-300 font-medium">
                                      {(
                                        subcommand.usage_count || 0
                                      ).toLocaleString()}
                                    </div>
                                    <p className="text-xs text-emerald-300/60">
                                      uses
                                    </p>
                                  </div>
                                  <Switch
                                    checked={subcommand.is_enabled}
                                    onCheckedChange={(checked) =>
                                      toggleSubcommand(
                                        command.name,
                                        subcommand.name,
                                        checked
                                      )
                                    }
                                    className="data-[state=checked]:bg-emerald-600"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
