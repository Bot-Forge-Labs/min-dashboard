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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Shield,
  User,
  Calendar,
  Clock,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Punishment } from "@/types/database";
import { toast } from "sonner";

export function PunishmentsTable() {
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPunishments = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { data, error } = await supabase
        .from("punishments")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching punishments:", error);
        toast.error("Failed to fetch punishments");
        return;
      }

      setPunishments(data || []);

      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} punishments`);
      }
    } catch (error) {
      console.error("Error fetching punishments:", error);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPunishments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPunishments();
  };

  const handleRevokePunishment = async (punishmentId: number) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { error } = await supabase
        .from("punishments")
        .update({ active: false })
        .eq("id", punishmentId);

      if (error) {
        console.error("Error revoking punishment:", error);
        toast.error("Failed to revoke punishment");
        return;
      }

      toast.success("Punishment revoked successfully");
      fetchPunishments();
    } catch (error) {
      console.error("Error revoking punishment:", error);
      toast.error("Failed to revoke punishment");
    }
  };

  const getCommandColor = (command: string) => {
    switch (command.toLowerCase()) {
      case "ban":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "mute":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "warning":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const filteredPunishments = punishments.filter(
    (punishment) =>
      punishment.command_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      punishment.user_id.includes(searchTerm) ||
      punishment.moderator_id.includes(searchTerm) ||
      punishment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Active Punishments</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage and track user punishments
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
              {searchTerm
                ? "No punishments found matching your search."
                : "No punishments found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                User punishments will appear here when issued.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Type</TableHead>
                <TableHead className="text-emerald-200">User</TableHead>
                <TableHead className="text-emerald-200">Moderator</TableHead>
                <TableHead className="text-emerald-200">Reason</TableHead>
                <TableHead className="text-emerald-200">Issued</TableHead>
                <TableHead className="text-emerald-200">Expires</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPunishments.map((punishment) => (
                <TableRow
                  key={punishment.id}
                  className="border-emerald-400/20 hover:bg-white/5"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getCommandColor(punishment.command_name)}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {punishment.command_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400/60" />
                      <div>
                        <p className="font-medium text-white font-mono text-sm">
                          {punishment.user_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400/60" />
                      <div>
                        <p className="font-medium text-white font-mono text-sm">
                          {punishment.moderator_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-emerald-200/80 max-w-xs truncate">
                      {punishment.reason}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-emerald-200/80">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-sm">
                          {new Date(punishment.issued_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-emerald-200/60">
                          {new Date(punishment.issued_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {punishment.expires_at ? (
                      <div className="flex items-center gap-2 text-emerald-200/80">
                        <Clock className="w-4 h-4" />
                        <div>
                          <p className="text-sm">
                            {new Date(
                              punishment.expires_at
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-emerald-200/60">
                            {new Date(
                              punishment.expires_at
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                      >
                        Permanent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        punishment.active
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }
                    >
                      {punishment.active ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {punishment.active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokePunishment(punishment.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    )}
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
