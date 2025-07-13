"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, RefreshCw, Crown, Eye, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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
  name: string
}

export function RoleManagementPanel() {
  const [roles, setRoles] = useState<Role[]>([])
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    color: "#5865F2",
    permissions: "0",
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

      const guildData = data?.map((g) => ({ guild_id: g.guild_id, name: g.guild_name || g.guild_id })) || []
      setGuilds(guildData)

      if (guildData.length > 0 && !selectedGuild) {
        setSelectedGuild(guildData[0].guild_id)
      }
    } catch (error) {
      console.error("Error fetching guilds:", error)
      toast.error("Failed to fetch guilds")
    }
  }

  const fetchRoles = async () => {
    if (!selectedGuild) return

    setLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        setLoading(false)
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

  const syncFromDiscord = async () => {
    if (!selectedGuild) return

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

      if (response.ok) {
        await fetchRoles()
        toast.success(`Successfully synced ${result.count} roles from Discord!`)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error syncing roles:", error)
      toast.error("Failed to sync roles from Discord")
    } finally {
      setSyncing(false)
    }
  }

  const createRole = async () => {
    if (!selectedGuild || !newRole.name.trim()) return

    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const roleData = {
        role_id: `custom_${Date.now()}`, // Generate a custom ID for dashboard-created roles
        guild_id: selectedGuild,
        name: newRole.name.trim(),
        color: newRole.color.replace("#", ""),
        position: 0,
        permissions: newRole.permissions,
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

      await fetchRoles()
      setIsCreateDialogOpen(false)
      setNewRole({
        name: "",
        color: "#5865F2",
        permissions: "0",
        hoist: false,
        mentionable: true,
      })
      toast.success("Role created successfully")
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error("Failed to create role")
    }
  }

  const deleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return

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

      await fetchRoles()
      toast.success("Role deleted successfully")
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Failed to delete role")
    }
  }

  const getRoleColor = (color: string) => {
    if (!color || color === "0") return "#99AAB5" // Default Discord role color
    return `#${color.padStart(6, "0")}`
  }

  const getPermissionBadges = (permissions: string) => {
    const perms = Number.parseInt(permissions)
    const badges = []

    if (perms & 0x8) badges.push("Administrator")
    if (perms & 0x10) badges.push("Manage Channels")
    if (perms & 0x20) badges.push("Manage Server")
    if (perms & 0x40000000) badges.push("Manage Roles")
    if (perms & 0x2) badges.push("Kick Members")
    if (perms & 0x4) badges.push("Ban Members")

    return badges.slice(0, 3) // Show max 3 badges
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 bg-emerald-400/20 mb-2" />
              <Skeleton className="h-4 w-48 bg-emerald-400/20" />
            </div>
            <Skeleton className="h-10 w-32 bg-emerald-400/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-4 h-4 rounded-full bg-emerald-400/20" />
                <Skeleton className="h-5 w-24 bg-emerald-400/20" />
              </div>
              <Skeleton className="h-8 w-20 bg-emerald-400/20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Role Management</CardTitle>
            <p className="text-emerald-200/80 text-sm">Manage server roles and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={syncFromDiscord}
              disabled={syncing || !selectedGuild}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync from Discord"}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Role</DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    Create a custom role for your server
                  </DialogDescription>
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
                      className="bg-white/10 border-emerald-400/20 text-white"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-color" className="text-emerald-200">
                      Role Color
                    </Label>
                    <Input
                      id="role-color"
                      type="color"
                      value={newRole.color}
                      onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                      className="bg-white/10 border-emerald-400/20 h-12"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hoist"
                      checked={newRole.hoist}
                      onCheckedChange={(checked) => setNewRole({ ...newRole, hoist: checked })}
                    />
                    <Label htmlFor="hoist" className="text-emerald-200">
                      Display separately (hoist)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mentionable"
                      checked={newRole.mentionable}
                      onCheckedChange={(checked) => setNewRole({ ...newRole, mentionable: checked })}
                    />
                    <Label htmlFor="mentionable" className="text-emerald-200">
                      Allow anyone to mention
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createRole}
                    disabled={!newRole.name.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {guilds.length > 0 && (
          <div className="mb-6">
            <Label className="text-emerald-200 mb-2 block">Select Server</Label>
            <select
              value={selectedGuild}
              onChange={(e) => setSelectedGuild(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/10 border border-emerald-400/20 text-white"
            >
              {guilds.map((guild) => (
                <option key={guild.guild_id} value={guild.guild_id} className="bg-gray-800">
                  {guild.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
          {roles.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
              <p className="text-emerald-200/60 mb-2">No roles found</p>
              <p className="text-sm text-emerald-300/40">Click "Sync from Discord" to import your server roles</p>
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.role_id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: getRoleColor(role.color) }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{role.name}</span>
                      {role.name === "@everyone" && <Crown className="w-4 h-4 text-yellow-400" />}
                      {role.managed && <Badge className="bg-blue-500/20 text-blue-400">Bot</Badge>}
                      {role.hoist && <Badge className="bg-purple-500/20 text-purple-400">Hoisted</Badge>}
                      <Badge className="bg-gray-500/20 text-gray-400">#{role.position}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPermissionBadges(role.permissions).map((perm) => (
                        <Badge key={perm} className="bg-emerald-500/20 text-emerald-400 text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.mentionable && <Eye className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!role.managed && role.name !== "@everyone" && (
                    <Button
                      onClick={() => deleteRole(role.role_id)}
                      size="sm"
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
