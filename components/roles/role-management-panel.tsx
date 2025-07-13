"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Trash2, Download, Crown, Shield, Users, Eye, MessageSquare, Settings, Loader2 } from "lucide-react"

interface Role {
  role_id: string
  guild_id: string
  name: string
  color: string
  permissions: string
  position?: number
  hoist?: boolean
  managed?: boolean
  mentionable?: boolean
  created_at: string
}

interface Guild {
  guild_id: string
  guild_name?: string
}

export function RoleManagementPanel() {
  const [roles, setRoles] = useState<Role[]>([])
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    color: "#99AAB5",
    permissions: "0",
  })

  useEffect(() => {
    fetchGuilds()
  }, [])

  useEffect(() => {
    if (selectedGuild) {
      fetchRoles()
    }
  }, [selectedGuild])

  async function fetchGuilds() {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const { data, error } = await supabase.from("guild_settings").select("guild_id, guild_name")

      if (error) {
        console.error("Error fetching guilds:", error)
        toast.error("Failed to fetch guilds")
        return
      }

      setGuilds(data || [])
      if (data && data.length > 0) {
        setSelectedGuild(data[0].guild_id)
      }
    } catch (error) {
      console.error("Error fetching guilds:", error)
      toast.error("Failed to load guilds")
    }
  }

  async function fetchRoles() {
    if (!selectedGuild) return

    try {
      setLoading(true)
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("guild_id", selectedGuild)
        .order("position", { ascending: false })

      if (error) {
        console.error("Error fetching roles:", error)
        toast.error("Failed to fetch roles")
        return
      }

      setRoles(data || [])
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  async function syncDiscordRoles() {
    if (!selectedGuild) {
      toast.error("Please select a guild first")
      return
    }

    setSyncing(true)
    try {
      const response = await fetch("/api/sync-discord-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guildId: selectedGuild }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to sync roles")
      }

      toast.success(`Successfully synced ${result.count} roles from Discord`)
      await fetchRoles()
    } catch (error) {
      console.error("Error syncing Discord roles:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sync Discord roles")
    } finally {
      setSyncing(false)
    }
  }

  async function createRole() {
    if (!selectedGuild || !newRole.name.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const roleId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { error } = await supabase.from("roles").insert({
        role_id: roleId,
        guild_id: selectedGuild,
        name: newRole.name,
        color: newRole.color.replace("#", ""),
        permissions: newRole.permissions,
        position: 1,
        hoist: false,
        managed: false,
        mentionable: true,
      })

      if (error) {
        console.error("Error creating role:", error)
        toast.error("Failed to create role")
        return
      }

      toast.success(`Role "${newRole.name}" created successfully`)
      setNewRole({ name: "", color: "#99AAB5", permissions: "0" })
      await fetchRoles()
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error("Failed to create role")
    } finally {
      setCreating(false)
    }
  }

  async function deleteRole(roleId: string, roleName: string) {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return
    }

    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const { error } = await supabase.from("roles").delete().eq("role_id", roleId)

      if (error) {
        console.error("Error deleting role:", error)
        toast.error("Failed to delete role")
        return
      }

      toast.success(`Role "${roleName}" deleted successfully`)
      await fetchRoles()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Failed to delete role")
    }
  }

  function getPermissionBadges(permissions: string) {
    const perms = BigInt(permissions || "0")
    const badges = []

    if (perms & BigInt(8)) badges.push({ name: "Admin", icon: Crown, color: "bg-red-100 text-red-800" })
    if (perms & BigInt(268435456))
      badges.push({ name: "Manage Server", icon: Settings, color: "bg-purple-100 text-purple-800" })
    if (perms & BigInt(268435456))
      badges.push({ name: "Manage Roles", icon: Shield, color: "bg-blue-100 text-blue-800" })
    if (perms & BigInt(1024)) badges.push({ name: "View Channels", icon: Eye, color: "bg-green-100 text-green-800" })
    if (perms & BigInt(2048))
      badges.push({ name: "Send Messages", icon: MessageSquare, color: "bg-gray-100 text-gray-800" })

    return badges.slice(0, 3) // Show max 3 badges
  }

  function getRoleColor(color: string) {
    if (!color || color === "0") return "#99AAB5"
    return `#${color.padStart(6, "0")}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Loading roles...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Guild Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Guild Selection</CardTitle>
          <CardDescription>Select a guild to manage roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="guild-select">Guild</Label>
              <select
                id="guild-select"
                value={selectedGuild}
                onChange={(e) => setSelectedGuild(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select a guild...</option>
                {guilds.map((guild) => (
                  <option key={guild.guild_id} value={guild.guild_id}>
                    {guild.guild_name || guild.guild_id}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={syncDiscordRoles} disabled={!selectedGuild || syncing} className="mt-6">
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Sync from Discord
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Role */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
          <CardDescription>Add a custom role to your server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="role-color">Role Color</Label>
              <Input
                id="role-color"
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={createRole}
                disabled={!selectedGuild || creating || !newRole.name.trim()}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>Server Roles ({roles.length})</CardTitle>
          <CardDescription>
            {selectedGuild ? "Manage roles for the selected guild" : "Select a guild to view roles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedGuild ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Please select a guild to view and manage roles</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No roles found for this guild</p>
              <p className="text-sm">Try syncing from Discord to import existing roles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.role_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: getRoleColor(role.color) }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{role.name}</span>
                        {role.position !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            #{role.position}
                          </Badge>
                        )}
                        {role.hoist && (
                          <Badge variant="secondary" className="text-xs">
                            Hoisted
                          </Badge>
                        )}
                        {role.managed && (
                          <Badge variant="destructive" className="text-xs">
                            Bot Managed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {getPermissionBadges(role.permissions).map((perm, index) => {
                          const Icon = perm.icon
                          return (
                            <Badge key={index} className={`text-xs ${perm.color}`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {perm.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!role.managed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRole(role.role_id, role.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
