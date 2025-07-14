"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { ModLog } from "@/types/database";
import { toast } from "sonner";

// Extend the DB type to include the view's extra fields
interface ModLogWithUsernames extends ModLog {
  user_username: string | null;
  action: string; // <- accept any string

  moderator_username: string | null;
}

export function ModerationTable() {
  const [modLogs, setModLogs] = useState<ModLogWithUsernames[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [guildFilter, setGuildFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [guilds, setGuilds] = useState<Array<{ id: string; name: string }>>([]);

  const fetchModLogs = async (): Promise<void> => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Try the view first
      // ✅ correct: no generic on `.from()`, but on `.select()`
      let { data, error } = await supabase
        .from("mod_logs_with_usernames")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Fallback to raw table if view missing
      if (error?.message.includes("does not exist")) {
        const res = await supabase
          .from("mod_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        data = res.data?.map((log) => ({
          ...log,
          user_username: "",
          moderator_username: "",
        })) as ModLogWithUsernames[];
        error = res.error;
      }

      if (error) {
        console.error("Error fetching mod logs:", error);
        toast.error("Failed to fetch moderation logs");
        return;
      }

      // Filter out any logs with null required fields and ensure type safety
      const validLogs = (data || [])
        .filter(
          (log): log is ModLogWithUsernames =>
            log.action !== null &&
            log.guild_id !== null &&
            log.user_id !== null &&
            log.moderator_id !== null &&
            log.id !== null
        )
        .map((log) => ({
          ...log,
          action: log.action!,
          guild_id: log.guild_id!,
          user_id: log.user_id!,
          moderator_id: log.moderator_id!,
          id: log.id!,
          created_at: log.created_at || new Date().toISOString(),
        }));

      setModLogs(validLogs);

      // extract guilds from valid logs only
      const uniqueGuilds = Array.from(
        new Set(validLogs.map((log) => log.guild_id))
      ).map((id) => ({
        id,
        name: `Guild ${id.slice(-4)}`,
      }));
      setGuilds(uniqueGuilds);

      if (data?.length) {
        toast.success(`Loaded ${data.length} moderation logs`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  console.log({
    modLogs,
  });

  useEffect(() => {
    fetchModLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchModLogs();
  };

  const getActionColor = (action: string): string => {
    switch (action.toLowerCase()) {
      case "ban":
        return "destructive";
      case "kick":
        return "destructive";
      case "warn":
        return "secondary";
      case "timeout":
        return "secondary";
      case "unban":
        return "default";
      default:
        return "default";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "ban":
        return Ban;
      case "kick":
        return UserX;
      case "warn":
        return AlertTriangle;
      case "timeout":
        return Clock;
      case "unban":
        return CheckCircle;
      default:
        return Shield;
    }
  };

  const filteredLogs = modLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.user_username?.toLowerCase().includes(term) ||
      log.moderator_username?.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.user_id.includes(term) ||
      log.moderator_id.includes(term);

    const matchesAction =
      actionFilter === "all" || log.action.toLowerCase() === actionFilter;
    const matchesGuild = guildFilter === "all" || log.guild_id === guildFilter;

    return matchesSearch && matchesAction && matchesGuild;
  });

  const parseDetails = (details: any) => {
    if (typeof details === "string") {
      try {
        return JSON.parse(details);
      } catch {
        return { reason: details };
      }
    }
    return details || {};
  };

  const formatDetails = (details: any) => {
    const parsed = parseDetails(details);

    if (!parsed || Object.keys(parsed).length === 0) {
      return "No details provided";
    }

    const formattedDetails = [];

    if (parsed.reason || parsed.original_reason) {
      formattedDetails.push(
        `Reason: ${parsed.reason || parsed.original_reason}`
      );
    }

    if (parsed.duration) {
      formattedDetails.push(`Duration: ${parsed.duration}`);
    }

    if (parsed.expires_at) {
      formattedDetails.push(
        `Expires: ${new Date(parsed.expires_at).toLocaleString()}`
      );
    }

    if (parsed.channel_id) {
      formattedDetails.push(
        `Channel: #${parsed.channel_name || parsed.channel_id.slice(-4)}`
      );
    }

    if (parsed.message_id) {
      formattedDetails.push(`Message: ${parsed.message_id.slice(-8)}`);
    }

    Object.entries(parsed).forEach(([key, value]) => {
      if (
        ![
          "reason",
          "original_reason",
          "duration",
          "expires_at",
          "channel_id",
          "message_id",
          "channel_name",
        ].includes(key)
      ) {
        formattedDetails.push(
          `${key.charAt(0).toUpperCase() + key.slice(1)}: ${String(value)}`
        );
      }
    });

    return formattedDetails.length > 0
      ? formattedDetails.join(" • ")
      : "No details provided";
  };
  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-200/80">Loading moderation logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      {/* Header + filters */}
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

      {/* Table */}
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm || actionFilter !== "all" || guildFilter !== "all"
                ? "No logs found matching your filters."
                : "No moderation logs found."}
            </p>
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
                <TableHead className="text-emerald-200 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-emerald-400/20 hover:bg-white/5"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">
                        {log.user_username || "Unknown User"}
                      </div>
                      <div className="text-xs text-emerald-300/60 font-mono">
                        {log.user_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getActionColor(log.action)}
                    >
                      <span className="ml-1">{log.action}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-emerald-200">
                        {log.moderator_username || "Unknown Moderator"}
                      </div>
                      <div className="text-xs text-emerald-300/60 font-mono">
                        {log.moderator_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 max-w-md">
                    <div className="text-sm break-words">
                      {formatDetails(log.details)}
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {guilds.find((g) => g.id === log.guild_id)?.name ||
                      `Guild ${log.guild_id.slice(-4)}`}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(log.created_at ?? ""), {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="text-xs text-emerald-300/60">
                      {new Date(log.created_at ?? "").toLocaleDateString()}
                    </div>
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
  );
}
