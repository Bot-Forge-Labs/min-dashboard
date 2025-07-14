"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Users,
  Server,
  MessageSquare,
  Shield,
  Activity,
  Crown,
  Zap,
} from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalServers: number;
  totalCommands: number;
  totalModerationActions: number;
  totalRoles: number;
  totalGiveaways: number;
  totalAnnouncements: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalServers: 0,
    totalCommands: 0,
    totalModerationActions: 0,
    totalRoles: 0,
    totalGiveaways: 0,
    totalAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      if (!supabase) {
        throw new Error("Database connection failed");
      }

      // Initialize stats object
      const newStats: StatsData = {
        totalUsers: 0,
        totalServers: 0,
        totalCommands: 0,
        totalModerationActions: 0,
        totalRoles: 0,
        totalGiveaways: 0,
        totalAnnouncements: 0,
      };

      // Fetch all stats in parallel
      const [
        usersResult,
        serversResult,
        commandsResult,
        moderationResult,
        rolesResult,
        giveawaysResult,
        announcementsResult,
      ] = await Promise.allSettled([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("guild_settings")
          .select("*", { count: "exact", head: true }),
        supabase.from("commands").select("*", { count: "exact", head: true }),
        supabase.from("mod_logs").select("*", { count: "exact", head: true }),
        supabase.from("roles").select("*", { count: "exact", head: true }),
        supabase.from("giveaways").select("*", { count: "exact", head: true }),
        supabase
          .from("announcements")
          .select("*", { count: "exact", head: true }),
      ]);

      // Process results
      if (usersResult.status === "fulfilled" && !usersResult.value.error) {
        newStats.totalUsers = usersResult.value.count || 0;
      }

      if (serversResult.status === "fulfilled" && !serversResult.value.error) {
        newStats.totalServers = serversResult.value.count || 0;
      }

      if (
        commandsResult.status === "fulfilled" &&
        !commandsResult.value.error
      ) {
        newStats.totalCommands = commandsResult.value.count || 0;
      }

      if (
        moderationResult.status === "fulfilled" &&
        !moderationResult.value.error
      ) {
        newStats.totalModerationActions = moderationResult.value.count || 0;
      }

      if (rolesResult.status === "fulfilled" && !rolesResult.value.error) {
        newStats.totalRoles = rolesResult.value.count || 0;
      }

      if (
        giveawaysResult.status === "fulfilled" &&
        !giveawaysResult.value.error
      ) {
        newStats.totalGiveaways = giveawaysResult.value.count || 0;
      }

      if (
        announcementsResult.status === "fulfilled" &&
        !announcementsResult.value.error
      ) {
        newStats.totalAnnouncements = announcementsResult.value.count || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard statistics");
      toast.error("Failed to load dashboard statistics");

      // Set fallback stats
      setStats({
        totalUsers: 0,
        totalServers: 1,
        totalCommands: 25,
        totalModerationActions: 0,
        totalRoles: 0,
        totalGiveaways: 0,
        totalAnnouncements: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      description: "Registered users",
    },
    {
      title: "Active Servers",
      value: stats.totalServers,
      icon: Server,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      description: "Connected guilds",
    },
    {
      title: "Commands",
      value: stats.totalCommands,
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      description: "Available commands",
    },
    {
      title: "Moderation Actions",
      value: stats.totalModerationActions,
      icon: Shield,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: "Total mod actions",
    },
    {
      title: "Server Roles",
      value: stats.totalRoles,
      icon: Crown,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      description: "Managed roles",
    },
    {
      title: "Active Giveaways",
      value: stats.totalGiveaways,
      icon: Activity,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      description: "Running giveaways",
    },
    {
      title: "Announcements",
      value: stats.totalAnnouncements,
      icon: MessageSquare,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      description: "Total announcements",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-emerald-400/20"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-emerald-400/20" />
              <Skeleton className="h-4 w-4 bg-emerald-400/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1 bg-emerald-400/20" />
              <Skeleton className="h-3 w-20 bg-emerald-400/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 backdrop-blur-xl border border-red-400/20">
          <CardContent>
            <div className="text-center text-red-400">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Failed to load stats</p>
              <button
                onClick={fetchStats}
                className="text-xs text-red-300 hover:text-red-200 mt-1"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`bg-white/5 backdrop-blur-xl border ${stat.borderColor} hover:bg-white/10 transition-all duration-300 hover:scale-105`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-emerald-200/80">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(stat.value)}
              </div>
              <p className="text-xs text-emerald-300/60 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
