"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Shield, Eye, Hash } from "lucide-react";
import type { Role } from "@/types/database";

interface RoleManagementPanelProps {
  guildId: string;
}

export function RoleManagementPanel({ guildId }: RoleManagementPanelProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching roles for guild:", guildId);
      const apiUrl =
        process.env.NEXT_PUBLIC_DASHBOARD_API_URL ||
        "https://min-bot.api.sogki.dev/";
      console.log("Primary API URL:", apiUrl);

      // Try primary API
      const response = await fetch(`${apiUrl}/api/roles?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      });
      console.log("Primary API response status:", response.status);
      const data = await response.text();
      console.log("Primary API raw response:", data);
      const parsedData = JSON.parse(data);
      if (!response.ok) {
        throw new Error(parsedData.error || `HTTP ${response.status}`);
      }
      const roles = Array.isArray(parsedData.roles) ? parsedData.roles : [];
      console.log("Parsed roles from primary API:", roles);
      setRoles(roles);
    } catch (err) {
      console.error("Error fetching roles from primary API:", err);
      // Fallback to Discord API
      try {
        console.log("Falling back to Discord API for guild:", guildId);
        const response = await fetch("/api/fetch-discord-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guild_id: guildId }),
        });
        console.log("Discord API response status:", response.status);
        const data = await response.text();
        console.log("Discord API raw response:", data);
        const parsedData = JSON.parse(data);
        if (!response.ok) {
          throw new Error(parsedData.message || `HTTP ${response.status}`);
        }
        // Map Discord API response to Role type
        const roles: Role[] = parsedData.map((role: any) => ({
          role_id: role.id,
          name: role.name,
          color: role.color,
          permissions: parseInt(role.permissions),
          position: role.position,
          hoist: role.hoist,
          mentionable: role.mentionable,
          managed: role.managed,
        }));
        console.log("Parsed roles from Discord API:", roles);
        setRoles(roles);
      } catch (discordErr) {
        console.error("Error fetching roles from Discord API:", discordErr);
        setError(
          discordErr instanceof Error
            ? discordErr.message
            : "Failed to fetch roles from Discord API"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const syncDiscordRoles = async () => {
    try {
      setSyncing(true);
      setError(null);
      console.log("Syncing roles for guild:", guildId);

      const response = await fetch("/api/sync-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild_id: guildId }),
      });

      console.log("Sync response status:", response.status);
      const data = await response.text();
      console.log("Sync raw response:", data);
      const parsedData = JSON.parse(data);

      if (!response.ok) {
        throw new Error(parsedData.error || `HTTP ${response.status}`);
      }

      console.log("Roles synced successfully:", parsedData);
      await fetchRoles();
    } catch (err) {
      console.error("Error syncing Discord roles:", err);
      setError(err instanceof Error ? err.message : "Failed to sync roles");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (guildId) {
      fetchRoles();
    }
  }, [guildId]);

  const getRoleColor = (color?: number): string => {
    if (!color || color === 0) return "#99AAB5"; // Default Discord gray
    return `#${color.toString(16).padStart(6, "0")}`;
  };

  const formatPermissions = (permissions?: number): string => {
    if (!permissions || permissions === 0) return "No permissions";

    const perms = [];
    if (permissions & 0x8) perms.push("Administrator");
    if (permissions & 0x10) perms.push("Manage Channels");
    if (permissions & 0x20) perms.push("Manage Server");
    if (permissions & 0x40) perms.push("Add Reactions");
    if (permissions & 0x400) perms.push("View Channels");
    if (permissions & 0x800) perms.push("Send Messages");
    if (permissions & 0x2000) perms.push("Manage Messages");
    if (permissions & 0x10000000) perms.push("Manage Roles");

    return perms.length > 0
      ? perms.slice(0, 3).join(", ") + (perms.length > 3 ? "..." : "")
      : "Custom permissions";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Loading roles...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management
            </CardTitle>
            <CardDescription>
              Manage Discord roles for this server ({roles.length} roles)
            </CardDescription>
          </div>
          <Button
            onClick={syncDiscordRoles}
            disabled={syncing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync from Discord"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-emerald-300/10 border border-green-200 rounded-md">
            <p className="text-sm text-emerald-200">{error}</p>
          </div>
        )}

        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium text-emerald-200 mb-2">
              No roles found
            </h3>
            <p className="text-gray-200 mb-4">
              Click "Sync from Discord" to import roles from your Discord
              server.
            </p>
            <Button onClick={syncDiscordRoles} disabled={syncing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync from Discord"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {roles
              .sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
              .map((role) => (
                <div
                  key={role.role_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: getRoleColor(role.color ?? 0) }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {role.name ?? "Unnamed Role"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatPermissions(role.permissions ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {role.hoist && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Hoisted
                      </Badge>
                    )}
                    {role.mentionable && (
                      <Badge variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        Mentionable
                      </Badge>
                    )}
                    {role.managed && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Managed
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      Pos: {role.position ?? 0}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}