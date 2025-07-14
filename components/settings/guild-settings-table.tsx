"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Search,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { GuildSettings } from "@/types/database";
import { toast } from "sonner";

export function GuildSettingsTable() {
  const [guildSettings, setGuildSettings] = useState<GuildSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuildSettings = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { data, error } = await supabase
        .from("guild_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching guild settings:", error);
        toast.error("Failed to fetch guild settings");
        return;
      }

      setGuildSettings(data || []);
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} guild settings`);
      }
    } catch (error) {
      console.error("Error fetching guild settings:", error);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuildSettings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGuildSettings();
  };

  const filteredSettings = guildSettings.filter((setting) =>
    setting.guild_id.toString().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading guild settings...</p>
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
            <CardTitle className="text-white">Guild Settings</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Configure settings for individual Discord servers
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
              placeholder="Search guild settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSettings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm
                ? "No guild settings found matching your search."
                : "No guild settings found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Guild settings will appear here once servers are configured.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Guild ID</TableHead>
                <TableHead className="text-emerald-200">
                  Staff Log Channel
                </TableHead>
                <TableHead className="text-emerald-200">Muted Role</TableHead>
                <TableHead className="text-emerald-200">
                  Join/Leave Channel
                </TableHead>
                <TableHead className="text-emerald-200">
                  Ticket Channel
                </TableHead>
                <TableHead className="text-emerald-200 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettings.map((setting) => (
                <TableRow
                  key={setting.guild_id}
                  className="border-emerald-400/20 hover:bg-white/5"
                >
                  <TableCell className="font-mono text-white">
                    {setting.guild_id.toString()}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {setting.staff_log_channel_id?.toString() || "Not set"}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {setting.muted_role_id?.toString() || "Not set"}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {setting.join_leave_channel_id?.toString() || "Not set"}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {setting.ticket_channel_id?.toString() || "Not set"}
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
                      <DropdownMenuContent
                        align="end"
                        className="bg-white/10 backdrop-blur-xl border-emerald-400/20"
                      >
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          View Details
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
  );
}
