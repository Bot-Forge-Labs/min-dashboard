// role-management-panel.tsx
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

      // Use environment variable for min-api base URL
      const apiUrl =
        process.env.DASHBOARD_API_URL || "https://min-bot.api.sogki.dev/";
      const response = await fetch(`${apiUrl}/api/roles?guild_id=${guildId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch roles");
      }

      console.log("Fetched roles:", data.roles);
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const syncDiscordRoles = async () => {
    try {
      setSyncing(true);
      setError(null);

      console.log("Syncing roles for guild:", guildId);

      const response = await fetch(
        "https://min-bot.api.sogki.dev/api/sync-discord-roles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.DASHBOARD_API_KEY}`, // Replace YOUR_API_KEY with the actual API key or token
          },
          body: JSON.stringify({ guild_id: guildId }),
        }
      );

      // First check if the response is OK (status 2xx)
      if (!response.ok) {
        const errorData = await response.text(); // Get the raw response text (in case it's not JSON)
        throw new Error(errorData || `HTTP ${response.status}`);
      }

      // If the response is OK, parse the JSON data
      const data = await response.json();

      console.log("Roles synced successfully:", data);

      // Refresh the roles list
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No roles found
            </h3>
            <p className="text-gray-500 mb-4">
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
