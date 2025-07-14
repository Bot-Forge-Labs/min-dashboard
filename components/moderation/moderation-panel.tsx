"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { Database } from "../../types/database.types";
import { getGuildId } from '@/lib/getGuildId';
import { toast } from "sonner";
import {
  Ban,
  UserX,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  Loader2,
  Eye,
  History,
} from "lucide-react";
import { useRouter } from "next/router";

interface User {
  id: string;
  username: string;
  discriminator?: string;
  avatar_url?: string;
  roles: string[] | null;
  message_count?: number;
  joined_at: string | null;
  last_active?: string | null;
  left_at?: string | null;
  level?: number | null;
  status?: string | null;
  xp?: number | null;
}

interface PunishmentForm {
  userId: string;
  action: "warn" | "mute" | "timeout" | "kick" | "ban";
  reason: string;
  duration?: string;
  deleteMessages?: boolean;
}


export function ModerationPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [punishmentForm, setPunishmentForm] = useState<PunishmentForm>({
    userId: "",
    action: "warn",
    reason: "",
    duration: "",
    deleteMessages: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);
  

  const fetchUsers = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Database connection failed");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("joined_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
        return;
      }

      setUsers(
        (data || []).map((user) => ({
          ...user,
          avatar: user.avatar ?? "",
          bot: user.bot ?? false,
          discord_id: user.discord_id ?? "",
          discriminator: user.discriminator ?? "",
          email: user.email ?? "",
          flags: user.flags ?? [],
          is_admin: user.is_admin ?? false,
          username: user.username ?? "",
          joined_at: user.joined_at ?? "",
          last_active: user.last_active ?? "",
          message_count: user.message_count ?? 0,
          // ensure all required fields on User type are handled
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
    }
  };

  const handlePunishUser = async () => {
    if (!selectedUser || !punishmentForm.reason.trim()) {
      toast.error("Please select a user and provide a reason");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Database connection failed");
        return;
      }

      // Get current user (moderator)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }


      const guildId = getGuildId(router.query);
      type PunishmentInsert = Database["public"]["Tables"]["punishments"]["Insert"];

      // Create punishment record
      const punishmentData: PunishmentInsert = {
        user_id: selectedUser.id, // required
        moderator_id: user.id, // required
        guild_id: guildId, // **You MUST add guild_id here, it's required**

        command_name: punishmentForm.action ?? null,
        reason: punishmentForm.reason ?? null,
        expires_at: punishmentForm.duration
          ? new Date(
              Date.now() + parseDuration(punishmentForm.duration)
            ).toISOString()
          : null,
        active: ["mute", "timeout", "ban"].includes(punishmentForm.action),
        // Optionally:
        issued_at: new Date().toISOString(),
      };

      const { error: punishmentError } = await supabase
        .from("punishments")
        .insert(punishmentData);

      if (punishmentError) {
        console.error("Error creating punishment:", punishmentError);
        toast.error("Failed to create punishment record");
        return;
      }

      // Create moderation log
      const logData = {
        user_id: selectedUser.id,
        moderator_id: user.id,
        action: punishmentForm.action,
        guild_id: "default_guild",
        details: {
          reason: punishmentForm.reason,
          duration: punishmentForm.duration,
          deleteMessages: punishmentForm.deleteMessages,
          expires_at: punishmentData.expires_at,
        },
      };

      const { error: logError } = await supabase
        .from("mod_logs")
        .insert(logData);

      if (logError) {
        console.error("Error creating mod log:", logError);
      }

      // Execute punishment via Discord API
      try {
        const response = await fetch("/api/discord/punish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.id,
            action: punishmentForm.action,
            reason: punishmentForm.reason,
            duration: punishmentForm.duration,
            deleteMessages: punishmentForm.deleteMessages,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        toast.success(
          `Successfully ${punishmentForm.action}ned ${selectedUser.username}`
        );
      } catch (discordError) {
        console.error("Discord API error:", discordError);
        toast.warning("Punishment logged but Discord action may have failed");
      }

      // Reset form and close dialog
      setPunishmentForm({
        userId: "",
        action: "warn",
        reason: "",
        duration: "",
        deleteMessages: false,
      });
      setSelectedUser(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error punishing user:", error);
      toast.error("Failed to punish user");
    } finally {
      setSubmitting(false);
    }
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = Number.parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const openPunishmentDialog = (
    user: User,
    action: PunishmentForm["action"]
  ) => {
    setSelectedUser(user);
    setPunishmentForm((prev) => ({
      ...prev,
      userId: user.id,
      action,
      reason: "",
      duration: "",
      deleteMessages: false,
    }));
    setDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.includes(searchTerm)
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case "warn":
        return <AlertTriangle className="w-4 h-4" />;
      case "mute":
      case "timeout":
        return <Clock className="w-4 h-4" />;
      case "kick":
        return <UserX className="w-4 h-4" />;
      case "ban":
        return <Ban className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "warn":
        return "bg-yellow-600 hover:bg-yellow-500";
      case "mute":
      case "timeout":
        return "bg-purple-600 hover:bg-purple-500";
      case "kick":
        return "bg-orange-600 hover:bg-orange-500";
      case "ban":
        return "bg-red-600 hover:bg-red-500";
      default:
        return "bg-gray-600 hover:bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderation Panel
          </CardTitle>
          <CardDescription className="text-emerald-200/80">
            Manage users and apply moderation actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>

          {/* Users List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-emerald-400/20 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={
                        user.avatar_url ||
                        `https://cdn.discordapp.com/embed/avatars/${Math.floor(
                          Math.random() * 6
                        )}.png`
                      }
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">
                      {user.username}
                      {user.discriminator && `#${user.discriminator}`}
                    </div>
                    <div className="text-sm text-emerald-300/60">
                      {user.message_count || 0} messages • Joined{" "}
                      {user.joined_at
                        ? new Date(user.joined_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {user.roles &&
                        user.roles.slice(0, 3).map((role, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      {user.roles && user.roles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.roles.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => openPunishmentDialog(user, "warn")}
                    size="sm"
                    className={getActionColor("warn")}
                  >
                    {getActionIcon("warn")}
                    <span className="ml-1">Warn</span>
                  </Button>
                  <Button
                    onClick={() => openPunishmentDialog(user, "timeout")}
                    size="sm"
                    className={getActionColor("timeout")}
                  >
                    {getActionIcon("timeout")}
                    <span className="ml-1">Timeout</span>
                  </Button>
                  <Button
                    onClick={() => openPunishmentDialog(user, "kick")}
                    size="sm"
                    className={getActionColor("kick")}
                  >
                    {getActionIcon("kick")}
                    <span className="ml-1">Kick</span>
                  </Button>
                  <Button
                    onClick={() => openPunishmentDialog(user, "ban")}
                    size="sm"
                    className={getActionColor("ban")}
                  >
                    {getActionIcon("ban")}
                    <span className="ml-1">Ban</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-emerald-200/60">
              <p>No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Punishment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-emerald-400/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {getActionIcon(punishmentForm.action)}
              {punishmentForm.action.charAt(0).toUpperCase() +
                punishmentForm.action.slice(1)}{" "}
              User
            </DialogTitle>
            <DialogDescription className="text-emerald-200/80">
              {selectedUser &&
                `Apply ${punishmentForm.action} to ${selectedUser.username}#${selectedUser.discriminator}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-emerald-200">Action</Label>
              <Select
                value={punishmentForm.action}
                onValueChange={(value: PunishmentForm["action"]) =>
                  setPunishmentForm((prev) => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-400/20">
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="mute">Mute</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                  <SelectItem value="kick">Kick</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-emerald-200">Reason *</Label>
              <Textarea
                placeholder="Enter reason for this action..."
                value={punishmentForm.reason}
                onChange={(e) =>
                  setPunishmentForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
                rows={3}
              />
            </div>

            {["mute", "timeout", "ban"].includes(punishmentForm.action) && (
              <div>
                <Label className="text-emerald-200">Duration (optional)</Label>
                <Input
                  placeholder="e.g., 1h, 30m, 7d"
                  value={punishmentForm.duration}
                  onChange={(e) =>
                    setPunishmentForm((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
                />
                <p className="text-xs text-emerald-300/60 mt-1">
                  Format: 1s, 5m, 2h, 7d (seconds, minutes, hours, days)
                </p>
              </div>
            )}

            {punishmentForm.action === "ban" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="deleteMessages"
                  checked={punishmentForm.deleteMessages}
                  onChange={(e) =>
                    setPunishmentForm((prev) => ({
                      ...prev,
                      deleteMessages: e.target.checked,
                    }))
                  }
                  className="rounded border-emerald-400/20"
                />
                <Label htmlFor="deleteMessages" className="text-emerald-200">
                  Delete recent messages (7 days)
                </Label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePunishUser}
                disabled={submitting || !punishmentForm.reason.trim()}
                className={`${getActionColor(
                  punishmentForm.action
                )} text-white`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  getActionIcon(punishmentForm.action)
                )}
                <span className="ml-2">
                  {submitting
                    ? "Processing..."
                    : `${
                        punishmentForm.action.charAt(0).toUpperCase() +
                        punishmentForm.action.slice(1)
                      } User`}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
