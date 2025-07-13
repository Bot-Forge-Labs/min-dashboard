"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Trash2, Download, Users } from "lucide-react"

interface Role {
  role_id: string
  guild_id: string
  name: string
  color: string
  position: number
  permissions: string
  hoist: boolean
  mentionable: boolean
  managed: boolean
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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    color: "#99AAB5",
    hoist: false,
    mentionable: true,
  })

  useEffect(() => {
    fetchGuilds()
  }, [])

  useEffect(() => {
    if (selectedGuild) {
      fetchRoles()
    }
  }, [selectedGuild])

  const fetchGuilds = async () => {
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
      toast.error("Failed to fetch guilds")
    }
  }

  const fetchRoles = async () => {
    if (!selectedGuild) return

    try {
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
      toast.error("Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }

  const syncDiscordRoles = async () => {
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

  const createRole = async () => {
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

      const roleData = {
        role_id: `custom_${Date.now()}`,
        guild_id: selectedGuild,
        name: newRole.name.trim(),
        color: newRole.color.replace("#", ""),
        position: roles.length + 1,
        permissions: "0",
        hoist: newRole.hoist,
        mentionable: newRole.mentionable,
        managed: false,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("roles").insert([roleData])

      if (error) {
        console.error("Error creating role:", error)
        toast.error("Failed to create role")
        return
      }

      toast.success("Role created successfully")
      setShowCreateDialog(false)
      setNewRole({ name: "", color: "#99AAB5", hoist: false, mentionable: true })
      await fetchRoles()
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error("Failed to create role")
    } finally {
      setCreating(false)
    }
  }

  const deleteRole = async (roleId: string, roleName: string) => {
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

      toast.success("Role deleted successfully")
      await fetchRoles()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Failed to delete role")
    }
  }

  const getRoleColor = (color: string) => {
    if (!color || color === "0") return "#99AAB5"
    if (color.startsWith("#")) return color
    return `#${color.padStart(6, "0")}`
  }

  const getPermissionBadges = (permissions: string) => {
    const permissionValue = BigInt(permissions || "0")
    const badges = []

    if (permissionValue & BigInt(8)) badges.push({ label: "Admin", color: "bg-red-500" })
    if (permissionValue & BigInt(268435456)) badges.push({ label: "Manage Roles", color: "bg-orange-500" })
    if (permissionValue & BigInt(8192)) badges.push({ label: "Manage Messages", color: "bg-yellow-500" })
    if (permissionValue & BigInt(1024)) badges.push({ label: "View Channels", color: "bg-blue-500" })

    return badges.length > 0 ? badges : [{ label: "No Permissions", color: "bg-gray-500" }]
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
        <CardHeader>
          <CardTitle className="text-white">Role Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-emerald-400/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-4 h-4 rounded-full bg-emerald-400/20" />
                <Skeleton className="h-4 w-24 bg-emerald-400/20" />
              </div>
              <Skeleton className="h-8 w-16 bg-emerald-400/20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Role Management</span>
          <div className="flex space-x-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role-name" className="text-emerald-200">
                      Role Name
                    </Label>
                    <Input
                      id="role-name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="Enter role name"
                      className="bg-white/10 border-emerald-400/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-color" className="text-emerald-200">
                      Role Color
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="role-color"
                        type="color"
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        className="w-16 h-10 bg-white/10 border-emerald-400/20"
                      />
                      <Input
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        placeholder="#99AAB5"
                        className="flex-1 bg-white/10 border-emerald-400/20 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="role-hoist"
                      checked={newRole.hoist}
                      onChange={(e) => setNewRole({ ...newRole, hoist: e.target.checked })}
                      className="rounded border-emerald-400/20"
                    />
                    <Label htmlFor="role-hoist" className="text-emerald-200">
                      Display separately (hoist)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="role-mentionable"
                      checked={newRole.mentionable}
                      onChange={(e) => setNewRole({ ...newRole, mentionable: e.target.checked })}
                      className="rounded border-emerald-400/20"
                    />
                    <Label htmlFor="role-mentionable" className="text-emerald-200">
                      Allow anyone to mention
                    </Label>
                  </div>
                  <Button
                    onClick={createRole}
                    disabled={creating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {creating ? "Creating..." : "Create Role"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={syncDiscordRoles}
              disabled={syncing || !selectedGuild}
              size="sm"
              variant="outline"
              className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-600/20 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              {syncing ? "Syncing..." : "Sync from Discord"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="guild-select" className="text-emerald-200">
              Select Guild
            </Label>
            <Select value={selectedGuild} onValueChange={setSelectedGuild}>
              <SelectTrigger className="bg-white/10 border-emerald-400/20 text-white">
                <SelectValue placeholder="Select a guild" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-emerald-400/20">
                {guilds.map((guild) => (
                  <SelectItem
                    key={guild.guild_id}
                    value={guild.guild_id}
                    className="text-white hover:bg-emerald-600/20"
                  >
                    {guild.guild_name || guild.guild_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-8 text-emerald-200/60">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No roles found for this guild</p>
              <p className="text-sm text-emerald-300/40">Try syncing from Discord or create a new role</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.role_id}
                  className="flex items-center justify-between p-4 border border-emerald-400/20 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: getRoleColor(role.color) }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{role.name}</span>
                        <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/20">
                          #{role.position}
                        </Badge>
                        {role.hoist && <Badge className="bg-purple-500/20 text-purple-300">Hoisted</Badge>}
                        {role.managed && <Badge className="bg-blue-500/20 text-blue-300">Bot</Badge>}
                        {!role.mentionable && (
                          <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/20">
                            No Mention
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-1 mt-1">
                        {getPermissionBadges(role.permissions).map((badge, index) => (
                          <Badge key={index} className={`text-xs ${badge.color} text-white`}>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!role.managed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRole(role.role_id, role.name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
