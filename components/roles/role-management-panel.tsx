"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Users, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Role {
  role_id: string
  guild_id: string
  name: string
  color: number
  position: number
  permissions: string
  hoist: boolean
  mentionable: boolean
  managed: boolean
  created_at: string
  updated_at: string
}

interface RoleManagementPanelProps {
  guildId: string
}

export function RoleManagementPanel({ guildId }: RoleManagementPanelProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/roles?guild_id=${guildId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched roles:", data)

      if (data.roles && Array.isArray(data.roles)) {
        setRoles(data.roles)
      } else {
        console.warn("No roles found or invalid format:", data)
        setRoles([])
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast.error("Failed to fetch roles")
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const syncRoles = async () => {
    try {
      setSyncing(true)
      console.log("Syncing roles for guild:", guildId)

      const response = await fetch("/api/sync-discord-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guildId }),
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        toast.success(data.message || `Successfully synced ${data.count || 0} roles`)
        await fetchRoles() // Refresh the roles list
      } else {
        throw new Error(data.error || "Sync failed")
      }
    } catch (error) {
      console.error("Error syncing Discord roles:", error)
      toast.error(`Failed to sync roles: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (guildId) {
      fetchRoles()
    }
  }, [guildId])

  const getRoleColor = (color: number): string => {
    if (!color || color === 0) return "#99aab5" // Default Discord color
    return `#${color.toString(16).padStart(6, "0")}`
  }

  const formatPermissions = (permissions: string): string => {
    const permissionValue = BigInt(permissions || "0")
    if (permissionValue === BigInt(0)) return "No permissions"
    if ((permissionValue & BigInt(0x8)) !== BigInt(0)) return "Administrator"

    const permissionNames = []
    if ((permissionValue & BigInt(0x10)) !== BigInt(0)) permissionNames.push("Manage Channels")
    if ((permissionValue & BigInt(0x20)) !== BigInt(0)) permissionNames.push("Manage Server")
    if ((permissionValue & BigInt(0x2000)) !== BigInt(0)) permissionNames.push("Manage Messages")
    if ((permissionValue & BigInt(0x10000000)) !== BigInt(0)) permissionNames.push("Manage Roles")

    return permissionNames.length > 0
      ? permissionNames.slice(0, 2).join(", ") + (permissionNames.length > 2 ? "..." : "")
      : "Basic permissions"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Loading roles...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
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
            <CardDescription>Manage Discord roles for this server ({roles.length} roles)</CardDescription>
          </div>
          <Button onClick={syncRoles} disabled={syncing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Discord"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roles found</h3>
            <p className="text-muted-foreground mb-4">
              Click "Sync from Discord" to import roles from your Discord server.
            </p>
            <Button onClick={syncRoles} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync from Discord"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {roles
              .sort((a, b) => (b.position || 0) - (a.position || 0))
              .map((role) => (
                <div
                  key={role.role_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: getRoleColor(role.color) }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.managed && (
                          <Badge variant="secondary" className="text-xs">
                            Bot
                          </Badge>
                        )}
                        {role.hoist && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Hoisted
                          </Badge>
                        )}
                        {role.mentionable ? (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Mentionable
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Not Mentionable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPermissions(role.permissions)} • Position: {role.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">ID: {role.role_id.slice(-6)}</Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
