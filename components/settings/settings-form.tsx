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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Save,
  RefreshCw,
  User,
  Settings,
  Shield,
  Bell,
  MessageSquare,
  Calendar,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  banner?: string;
  roles: Array<{
    role_id: string;
    name: string;
    color: string;
    position: number;
  }>;
  messageCount: number;
  joinedAt: string;
  lastActive: string;
  channelActivity: Array<{
    channelId: string;
    channelName: string;
    messageCount: number;
  }>;
  status: "online" | "idle" | "dnd" | "offline";
  level: number;
  xp: number;
}

interface BotSettings {
  botName: string;
  autoModeration: boolean;
  welcomeMessages: boolean;
  loggingEnabled: boolean;
  maintenanceMode: boolean;
  antiSpam: boolean;
  autoRole: boolean;
  levelingSystem: boolean;
  musicEnabled: boolean;
  economyEnabled: boolean;
  ticketSystem: boolean;
}

export function SettingsForm() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<BotSettings>({
    botName: "Minbot",
    autoModeration: true,
    welcomeMessages: true,
    loggingEnabled: true,
    maintenanceMode: false,
    antiSpam: true,
    autoRole: false,
    levelingSystem: true,
    musicEnabled: true,
    economyEnabled: false,
    ticketSystem: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchBotSettings();
  }, []);

  const fetchUserProfile = async (retry = false) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        console.error("Supabase client initialization failed");
        toast.error("Database connection failed");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      console.log("Fetching user profile for auth.uid():", user.id);

      let userData = null;

      // Try fetching user by discord_id
      const { data: discordData, error: discordError } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          discriminator,
          avatar,
          banner,
          joined_at,
          last_active,
          status,
          level,
          xp
        `
        )
        .eq("discord_id", user.id)
        .maybeSingle();

      if (discordError) {
        console.error("Supabase discord_id fetch error:", {
          message: discordError.message,
          details: discordError.details,
          code: discordError.code,
        });
      } else if (discordData) {
        userData = discordData;
      }

      // Fallback to users.id
      if (!userData) {
        const { data: idData, error: idError } = await supabase
          .from("users")
          .select(
            `
            id,
            username,
            discriminator,
            avatar,
            banner,
            joined_at,
          last_active,
          status,
          level,
          xp
          `
          )
          .eq("id", user.id)
          .maybeSingle();

        if (idError) {
          console.error("Supabase id fetch error:", {
            message: idError.message,
            details: idError.details,
            code: idError.code,
          });
        } else {
          userData = idData;
        }
      }

      // If no user found, attempt to insert
      if (!userData) {
        console.log("No user found, attempting to insert:", {
          userId: user.id,
          metadata: user.user_metadata,
        });
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            discord_id: user.id,
            username: user.user_metadata?.username || "Unknown User",
            discriminator: user.user_metadata?.discriminator || "0000",
            avatar: user.user_metadata?.avatar_url || null,
            joined_at: new Date().toISOString(),
            status: "offline",
            level: 1,
            xp: 0,
          })
          .select(
            `
            id,
            username,
            discriminator,
            avatar,
            banner,
            joined_at,
            last_active,
            status,
            level,
            xp
          `
          )
          .maybeSingle();

        if (insertError) {
          console.error("Error inserting user:", {
            message: insertError.message,
            details: insertError.details,
            code: insertError.code,
          });
          toast.error(`Failed to create user profile: ${insertError.message}`);
          if (!retry) {
            console.log("Retrying fetchUserProfile after insertion failure");
            await fetchUserProfile(true); // Retry once
          } else {
            await fetchDiscordProfile(user.id);
          }
          setLoading(false);
          return;
        }
        userData = newUser;
      }

      if (!userData) {
        console.error("No user data available after queries and insertion:", {
          userId: user.id,
        });
        await fetchDiscordProfile(user.id);
        setLoading(false);
        return;
      }

      let roles: Array<{
        role_id: string;
        name: string;
        color: string;
        position: number;
      }> = [];
      let messageCount = 0;

      // Fetch roles with enhanced error logging
      const { data: userRolesData, error: userRolesError, status } = await supabase
        .from("user_roles")
        .select(
          `
          role_id,
          roles (
            role_id,
            name,
            color,
            position
          )
        `
        )
        .eq("user_id", userData.id);

      if (userRolesError) {
        console.error("Error fetching user roles:", {
          message: userRolesError.message,
          details: userRolesError.details,
          code: userRolesError.code,
          status: status,
          query: `user_roles?select=role_id,roles(role_id,name,color,position)&user_id=eq.${userData.id}`,
        });
        if (status === 400) {
          console.warn("400 Bad Request - Check foreign key relationship between user_roles and roles");
        }
      } else {
        roles = userRolesData?.map((ur: any) => ({
          role_id: ur.roles?.role_id || ur.role_id || "unknown",
          name: ur.roles?.name || "Unknown Role",
          color: ur.roles?.color || "#10b981",
          position: ur.roles?.position || 0,
        })) ?? [];
      }

      // Fetch total message count from user_messages
      const { data: messageData, error: messageError } = await supabase
        .from("user_messages")
        .select("count")
        .eq("user_id", userData.id);

      if (messageError) {
        console.error("Error fetching message count:", {
          message: messageError.message,
          details: messageError.details,
          code: messageError.code,
        });
      } else {
        messageCount = messageData?.reduce((sum: number, msg: any) => sum + msg.count, 0) ?? 0;
      }

      // Fetch channel activity
      const { data: channelData, error: channelError } = await supabase
        .from("user_messages")
        .select(
          `
          channel_id,
          channels (name),
          count
        `
        )
        .eq("user_id", userData.id)
        .order("count", { ascending: false })
        .limit(5);

      if (channelError) {
        console.error("Error fetching channel activity:", {
          message: channelError.message,
          details: channelError.details,
          code: channelError.code,
        });
      }

      setUserProfile({
        id: userData.id,
        username: userData.username ?? "Unknown User",
        discriminator: userData.discriminator ?? "0000",
        avatar:
          userData.avatar ??
          `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`,
        banner: userData.banner ?? undefined,
        roles,
        messageCount,
        joinedAt: userData.joined_at ?? new Date().toISOString(),
        lastActive: userData.last_active ?? new Date().toISOString(),
        channelActivity:
          channelData?.map((ch: any) => ({
            channelId: ch.channel_id,
            channelName: ch.channels?.name ?? "Unknown Channel",
            messageCount: ch.count,
          })) ?? [],
        status:
          userData.status === "online" ||
          userData.status === "idle" ||
          userData.status === "dnd"
            ? userData.status
            : "offline",
        level: userData.level ?? 1,
        xp: userData.xp ?? 0,
      });
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      toast.error("Unexpected error loading user profile");
      await fetchDiscordProfile(user?.id || "");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscordProfile = async (userId: string) => {
    if (!userId) {
      console.error("No user ID provided for Discord profile fetch");
      toast.error("No user ID provided for Discord profile fetch");
      setUserProfile({
        id: "unknown",
        username: "Unknown User",
        discriminator: "0000",
        avatar: "https://nqbdotjtceuyftutjvsl.supabase.co/storage/v1/object/public/assets/minbot-icon-transparent.png",
        banner: undefined,
        roles: [],
        messageCount: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        channelActivity: [],
        status: "offline",
        level: 1,
        xp: 0,
      });
      return;
    }
    try {
      const response = await fetch(`/api/discord/user/${userId}`, {
        headers: {
          Accept: "application/json",
        },
      });
      const responseText = await response.text();
      console.log("Discord API response:", { status: response.status, body: responseText });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }

      const discordUser = JSON.parse(responseText);
      if (!discordUser.id) {
        throw new Error("Invalid Discord user data");
      }

      setUserProfile({
        id: discordUser.id,
        username: discordUser.username || "Unknown User",
        discriminator: discordUser.discriminator || "0000",
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`,
        banner: discordUser.banner
          ? `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.png`
          : undefined,
        roles: [],
        messageCount: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        channelActivity: [],
        status: "offline",
        level: 1,
        xp: 0,
      });
    } catch (error) {
      console.error("Error fetching Discord profile:", error);
      toast.error("Failed to load Discord profile");
      setUserProfile({
        id: userId,
        username: "Unknown User",
        discriminator: "0000",
        avatar: "https://nqbdotjtceuyftutjvsl.supabase.co/storage/v1/object/public/assets/minbot-icon-transparent.png",
        banner: undefined,
        roles: [],
        messageCount: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        channelActivity: [],
        status: "offline",
        level: 1,
        xp: 0,
      });
    }
  };

  const fetchBotSettings = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        console.error("Supabase client initialization failed");
        toast.error("Database connection failed");
        return;
      }

      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching bot settings:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
      } else if (data) {
        setSettings({
          botName: data.bot_name || "Minbot",
          autoModeration: data.auto_moderation || false,
          welcomeMessages: data.welcome_messages || false,
          loggingEnabled: data.logging_enabled || false,
          maintenanceMode: data.maintenance_mode || false,
          antiSpam: data.anti_spam || false,
          autoRole: data.auto_role || false,
          levelingSystem: data.leveling_system || false,
          musicEnabled: data.music_enabled || false,
          economyEnabled: data.economy_enabled || false,
          ticketSystem: data.ticket_system || false,
        });
      }
    } catch (error) {
      console.error("Error fetching bot settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        console.error("Supabase client initialization failed");
        toast.error("Database connection failed");
        return;
      }

      const { error } = await supabase.from("bot_settings").upsert({
        id: 1,
        bot_name: settings.botName,
        auto_moderation: settings.autoModeration,
        welcome_messages: settings.welcomeMessages,
        logging_enabled: settings.loggingEnabled,
        maintenance_mode: settings.maintenanceMode,
        anti_spam: settings.antiSpam,
        auto_role: settings.autoRole,
        leveling_system: settings.levelingSystem,
        music_enabled: settings.musicEnabled,
        economy_enabled: settings.economyEnabled,
        ticket_system: settings.ticketSystem,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving settings:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        toast.error("Failed to save settings");
        return;
      }

      await fetch("/api/bot/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof BotSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getXPProgress = () => {
    if (!userProfile) return 0;
    const xpForNextLevel = userProfile.level * 1000;
    return (userProfile.xp % 1000) / 10;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-emerald-400/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-emerald-400/20 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white/5 border-emerald-400/20">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-emerald-500/20"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="bot"
            className="data-[state=active]:bg-emerald-500/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Bot Settings
          </TabsTrigger>
          <TabsTrigger
            value="moderation"
            className="data-[state=active]:bg-emerald-500/20"
          >
            <Shield className="w-4 h-4 mr-2" />
            Moderation
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-emerald-500/20"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">User Profile</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Your Discord profile information and server activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile && (
                <div>
                  {/* Profile Banner */}
                  <div className="relative">
                    <div
                      className="h-32 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600"
                      style={{
                        backgroundImage: userProfile.banner
                          ? `url(${userProfile.banner})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="absolute -bottom-8 left-6">
                      <Avatar className="h-16 w-16 ring-2 ring-emerald-400/20">
                        <AvatarImage
                          src={userProfile.avatar || "https://nqbdotjtceuyftutjvsl.supabase.co/storage/v1/object/public/assets/minbot-icon-transparent.png"}
                          alt={userProfile.username}
                        />
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {userProfile.username?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(
                          userProfile.status
                        )}`}
                      />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {userProfile.username}#{userProfile.discriminator}
                        </h3>
                        <p className="text-emerald-200/80">
                          User ID: {userProfile.id}
                        </p>
                        <p className="text-emerald-300/60 text-sm">
                          Last active:{" "
                          }{formatDistanceToNow(
                            new Date(userProfile.lastActive),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          Level {userProfile.level}
                        </div>
                        <div className="text-sm text-emerald-200/80">
                          {userProfile.xp} XP
                        </div>
                        <div className="w-32 h-2 bg-white/10 rounded-full mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${getXPProgress()}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <div className="text-sm text-emerald-200/80">
                            Messages
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {userProfile.messageCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <div className="text-sm text-emerald-200/80">
                            Roles
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {userProfile.roles.length}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <div className="text-sm text-emerald-200/80">
                            Days Active
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {Math.floor(
                            (Date.now() -
                              new Date(userProfile.joinedAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <div className="text-sm text-emerald-200/80">
                            Activity
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {userProfile.status === "online"
                            ? "High"
                            : userProfile.status === "idle"
                            ? "Medium"
                            : "Low"}
                        </div>
                      </div>
                    </div>

                    {/* Roles */}
                    <div>
                      <Label className="text-emerald-200 text-base font-medium">
                        Your Roles
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userProfile.roles
                          .sort((a, b) => b.position - a.position)
                          .map((role) => (
                            <Badge
                              key={role.role_id}
                              variant="outline"
                              className="border-emerald-500/30"
                              style={{
                                backgroundColor: `${role.color}20`,
                                color: role.color || "#10b981",
                                borderColor: `${role.color}50`,
                              }}
                            >
                              {role.name}
                            </Badge>
                          ))}
                        {userProfile.roles.length === 0 && (
                          <span className="text-emerald-300/40">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Channel Activity */}
                    <div>
                      <Label className="text-emerald-200 text-base font-medium">
                        Channel Activity
                      </Label>
                      <div className="mt-2 space-y-2">
                        {userProfile.channelActivity.map((channel) => (
                          <div
                            key={channel.channelId}
                            className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-emerald-400/20"
                          >
                            <div>
                              <div className="text-white font-medium">
                                #{channel.channelName}
                              </div>
                              <div className="text-emerald-300/60 text-sm">
                                {channel.messageCount} messages
                              </div>
                            </div>
                            <div className="w-16 h-2 bg-white/10 rounded-full">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (channel.messageCount /
                                      Math.max(
                                        ...userProfile.channelActivity.map(
                                          (c) => c.messageCount
                                        ),
                                        1 // Avoid division by zero
                                      )) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {userProfile.channelActivity.length === 0 && (
                          <div className="text-emerald-300/40 text-center py-4">
                            No channel activity data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <Label className="text-emerald-200 text-base font-medium">
                        Member Since
                      </Label>
                      <p className="text-white mt-1">
                        {new Date(userProfile.joinedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Bot Configuration</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Configure bot settings and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="botName" className="text-emerald-200">
                    Bot Name
                  </Label>
                  <Input
                    id="botName"
                    value={settings.botName}
                    onChange={(e) => updateSetting("botName", e.target.value)}
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-emerald-400/20" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Core Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">
                        Auto Moderation
                      </Label>
                      <p className="text-sm text-emerald-300/60">
                        Automatically moderate inappropriate content
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoModeration}
                      onCheckedChange={(checked) =>
                        updateSetting("autoModeration", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">
                        Welcome Messages
                      </Label>
                      <p className="text-sm text-emerald-300/60">
                        Send welcome messages to new members
                      </p>
                    </div>
                    <Switch
                      checked={settings.welcomeMessages}
                      onCheckedChange={(checked) =>
                        updateSetting("welcomeMessages", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Logging</Label>
                      <p className="text-sm text-emerald-300/60">
                        Log all bot activities and moderation actions
                      </p>
                    </div>
                    <Switch
                      checked={settings.loggingEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("loggingEnabled", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Anti-Spam</Label>
                      <p className="text-sm text-emerald-300/60">
                        Prevent spam messages and raids
                      </p>
                    </div>
                    <Switch
                      checked={settings.antiSpam}
                      onCheckedChange={(checked) =>
                        updateSetting("antiSpam", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Auto Role</Label>
                      <p className="text-sm text-emerald-300/60">
                        Automatically assign roles to new members
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoRole}
                      onCheckedChange={(checked) =>
                        updateSetting("autoRole", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">
                        Leveling System
                      </Label>
                      <p className="text-sm text-emerald-300/60">
                        Enable XP and leveling for active members
                      </p>
                    </div>
                    <Switch
                      checked={settings.levelingSystem}
                      onCheckedChange={(checked) =>
                        updateSetting("levelingSystem", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Music System</Label>
                      <p className="text-sm text-emerald-300/60">
                        Enable music commands and voice features
                      </p>
                    </div>
                    <Switch
                      checked={settings.musicEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("musicEnabled", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Economy System</Label>
                      <p className="text-sm text-emerald-300/60">
                        Enable currency and shop features
                      </p>
                    </div>
                    <Switch
                      checked={settings.economyEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("economyEnabled", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Ticket System</Label>
                      <p className="text-sm text-emerald-300/60">
                        Enable support ticket creation
                      </p>
                    </div>
                    <Switch
                      checked={settings.ticketSystem}
                      onCheckedChange={(checked) =>
                        updateSetting("ticketSystem", checked)
                      }
                      className="data-[state=checked]:bg-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-400/20" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">
                  System Settings
                </h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-emerald-200">Maintenance Mode</Label>
                    <p className="text-sm text-emerald-300/60">
                      Disable bot for maintenance (admin only)
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting("maintenanceMode", checked)
                    }
                    className="data-[state=checked]:bg-emerald-800"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white/80"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Moderation Settings</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Configure moderation rules and automatic actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-emerald-200/60">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced moderation settings will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-emerald-200/80">
                Manage your notification settings and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-emerald-200/60">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Notification preferences will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}