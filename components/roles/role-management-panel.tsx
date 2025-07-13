"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2, Users, Shield, Loader2, RefreshCw, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Role, UserRole } from "@/lib/types/database"
import { toast } from "sonner"

interface GuildSettings {
  guild_id: string
}

export function RoleManagementPanel() {
  const [roles, setRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [guildSettings, setGuildSettings] = useState<GuildSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: "",
    color: "#8be2b9",
    permissions: 0,
    guild_id: "",
  })

  const fetchData = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      // Fetch guild settings to get available guilds
      const { data: guildSettingsData, error: guildSettingsError } = await supabase
        .from("guild_settings")
        .select("guild_id")
        .order("created_at", { ascending: false })

      if (guildSettingsError) {
        console.error("Error fetching guild settings:", guildSettingsError)
        toast.error("Failed to fetch guild settings")
        return
      }

      setGuildSettings(guildSettingsData || [])

      // Set default guild if available
      if (guildSettingsData && guildSettingsData.length > 0 && !newRole.guild_id) {
        setNewRole((prev) => ({ ...prev, guild_id: guildSettingsData[0].guild_id }))
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .order("position", { ascending: false })

      if (rolesError) {
        console.error("Error fetching roles:", rolesError)
        toast.error("Failed to fetch roles")
      } else {
        setRoles(rolesData || [])
        if (rolesData && rolesData.length > 0) {
          toast.success(`Loaded ${rolesData.length} roles`)
        }
      }

      // Fetch user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("assigned_at", { ascending: false })

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError)
        toast.error("Failed to fetch user roles")
      } else {
        setUserRoles(userRolesData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleSyncFromDiscord = async () => {
    if (guildSettings.length === 0) {
      toast.error("No guild found to sync from")
      return
    }

    setSyncing(true)
    try {
      const guildId = guildSettings[0].guild_id

      const response = await fetch("/api/sync-discord-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guildId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to sync roles")
      }

      toast.success(result.message)
      fetchData() // Refresh the data
    } catch (error) {
      console.error("Error syncing roles:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sync roles from Discord")
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      if (!newRole.name.trim()) {
        toast.error("Please enter a role name")
        return
      }

      if (!newRole.guild_id) {
        toast.error("Please select a guild")
        return
      }

      const colorInt = Number.parseInt(newRole.color.replace("#", ""), 16)

      const { error } = await supabase.from("roles").insert({
        role_id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a unique role ID
        guild_id: newRole.guild_id,
        name: newRole.name.trim(),
        color: colorInt,
        permissions: newRole.permissions,
        position: 0,
        hoist: false,
        managed: false,
        mentionable: true,
      })

      if (error) {
        console.error("Error creating role:", error)
        toast.error(`Failed to create role: ${error.message}`)
        return
      }

      toast.success("Role created successfully")
      setIsCreateDialogOpen(false)
      setNewRole({
        name: "",
        color: "#8be2b9",
        permissions: 0,
        guild_id: guildSettings[0]?.guild_id || "",
      })
      fetchData()
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error("Failed to create role")
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      return
    }

    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("roles").delete().eq("role_id", roleId)

      if (error) {
        console.error("Error deleting role:", error)
        toast.error(`Failed to delete role: ${error.message}`)
        return
      }

      toast.success("Role deleted successfully")
      fetchData()
    } catch (error) {
      console.error("Error deleting role:", error)
      toast.error("Failed to delete role")
    }
  }

  const getRoleUserCount = (roleId: string) => {
    return userRoles.filter((ur) => ur.role_id === roleId).length
  }

  const getPermissionNames = (permissions: number) => {
    const permissionFlags = [
      { flag: 1 << 3, name: "Administrator" },
      { flag: 1 << 5, name: "Manage Server" },
      { flag: 1 << 4, name: "Manage Channels" },
      { flag: 1 << 28, name: "Manage Roles" },
      { flag: 1 << 1, name: "Kick Members" },
      { flag: 1 << 2, name: "Ban Members" },
      { flag: 1 << 10, name: "View Channels" },
      { flag: 1 << 11, name: "Send Messages" },
    ]

    const activePermissions = permissionFlags.filter((perm) => (permissions & perm.flag) === perm.flag)
    return activePermissions.length > 0 ? activePermissions.map((p) => p.name).join(", ") : "No special permissions"
  }

  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()) || role.role_id.includes(searchTerm),
  )

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading roles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Role Management</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Sync and manage Discord server roles and permissions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFromDiscord}
              disabled={syncing || guildSettings.length === 0}
              className="border-blue-400/20 text-blue-200 hover:bg-blue-500/10 bg-transparent"
            >
              <Download className={`w-4 h-4 mr-2 ${syncing ? "animate-bounce" : ""}`} />
              {syncing ? "Syncing..." : "Sync from Discord"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  disabled={guildSettings.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Role</DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    Create a new role for your server with custom permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guildSelect" className="text-emerald-200">
                      Guild
                    </Label>
                    <select
                      id="guildSelect"
                      value={newRole.guild_id}
                      onChange={(e) => setNewRole({ ...newRole, guild_id: e.target.value })}
                      className="w-full mt-1 p-2 bg-white/5 border border-emerald-400/20 rounded-md text-white"
                    >
                      <option value="">Select a guild</option>
                      {guildSettings.map((guild) => (
                        <option key={guild.guild_id} value={guild.guild_id} className="bg-gray-800">
                          Guild ID: {guild.guild_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="roleName" className="text-emerald-200">
                      Role Name
                    </Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleColor" className="text-emerald-200">
                      Role Color
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="roleColor"
                        type="color"
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        className="w-16 h-10 bg-white/5 border-emerald-400/20"
                      />
                      <Input
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        className="bg-white/5 border-emerald-400/20 text-white"
                        placeholder="#8be2b9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rolePermissions" className="text-emerald-200">
                      Permissions (Bitfield)
                    </Label>
                    <Input
                      id="rolePermissions"
                      type="number"
                      value={newRole.permissions}
                      onChange={(e) => setNewRole({ ...newRole, permissions: Number.parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-emerald-300/60 mt-1">
                      Common values: 0 (no permissions), 8 (admin), 2048 (read messages)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRole}
                    disabled={!newRole.name.trim() || !newRole.guild_id}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {guildSettings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">No guilds found.</p>
            <p className="text-sm text-emerald-300/40">
              Make sure your bot is connected to a server and the guild settings are configured.
            </p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No roles found matching your search." : "No roles found."}
            </p>
            {!searchTerm && (
              <div className="space-y-2">
                <p className="text-sm text-emerald-300/40">Click "Sync from Discord" to import existing roles.</p>
                <Button
                  onClick={handleSyncFromDiscord}
                  disabled={syncing}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sync from Discord
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Role</TableHead>
                <TableHead className="text-emerald-200">Position</TableHead>
                <TableHead className="text-emerald-200">Color</TableHead>
                <TableHead className="text-emerald-200">Permissions</TableHead>
                <TableHead className="text-emerald-200">Properties</TableHead>
                <TableHead className="text-emerald-200">Members</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.role_id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-emerald-400/20"
                        style={{
                          backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#99aab5",
                        }}
                      />
                      <span className="font-medium text-white">{role.name}</span>
                      {role.managed && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs"
                        >
                          Bot
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                      {role.position || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-emerald-200/80 text-sm">
                    {role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#99aab5"}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        <Shield className="w-3 h-3 mr-1" />
                        {role.permissions || 0}
                      </Badge>
                      <p className="text-xs text-emerald-300/60 mt-1 truncate">
                        {getPermissionNames(role.permissions || 0)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.hoist && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs"
                        >
                          Hoisted
                        </Badge>
                      )}
                      {role.mentionable && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                          Mentionable
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <Users className="w-3 h-3 mr-1" />
                      {getRoleUserCount(role.role_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                        onClick={() => toast.info("Edit functionality coming soon!")}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteRole(role.role_id)}
                        disabled={role.managed}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
