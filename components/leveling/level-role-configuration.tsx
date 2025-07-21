"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, Crown } from "lucide-react"
import type { LevelRole } from "@/types/leveling"
import type { Role } from "@/types/database"
import { toast } from "sonner"

interface LevelRoleConfigurationProps {
  guildId: string
}

export function LevelRoleConfiguration({ guildId }: LevelRoleConfigurationProps) {
  const [levelRoles, setLevelRoles] = useState<LevelRole[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLevelRole, setNewLevelRole] = useState({
    level: 1,
    role_id: "",
  })

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch level roles
      const levelRolesResponse = await fetch(`/api/leveling/level-roles?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (levelRolesResponse.ok) {
        const levelRolesData = await levelRolesResponse.json()
        setLevelRoles(levelRolesData.level_roles || [])
      }

      // Fetch available roles
      const rolesResponse = await fetch(`/api/roles?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setAvailableRoles(rolesData.roles || [])
      }

      toast.success("Level role configuration loaded")
    } catch (error) {
      console.error("Error fetching level role data:", error)
      toast.error("Failed to fetch level role configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLevelRole = async () => {
    if (!newLevelRole.role_id || newLevelRole.level < 1) {
      toast.error("Please select a role and enter a valid level")
      return
    }

    try {
      const selectedRole = availableRoles.find((r) => r.role_id === newLevelRole.role_id)

      const response = await fetch("/api/leveling/level-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
        body: JSON.stringify({
          guild_id: guildId,
          level: newLevelRole.level,
          role_id: newLevelRole.role_id,
          role_name: selectedRole?.name || "Unknown Role",
          role_color: selectedRole?.color || 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create level role")
      }

      toast.success(`Level role created for level ${newLevelRole.level}`)
      setIsDialogOpen(false)
      setNewLevelRole({ level: 1, role_id: "" })
      fetchData()
    } catch (error) {
      console.error("Error creating level role:", error)
      toast.error("Failed to create level role")
    }
  }

  const handleDeleteLevelRole = async (levelRoleId: string) => {
    try {
      const response = await fetch(`/api/leveling/level-roles/${levelRoleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete level role")
      }

      toast.success("Level role deleted successfully")
      fetchData()
    } catch (error) {
      console.error("Error deleting level role:", error)
      toast.error("Failed to delete level role")
    }
  }

  const getRoleColor = (color?: number): string => {
    if (!color || color === 0) return "#99AAB5"
    return `#${color.toString(16).padStart(6, "0")}`
  }

  useEffect(() => {
    if (guildId) {
      fetchData()
    }
  }, [guildId])

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
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
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Level Role Configuration
            </CardTitle>
            <CardDescription className="text-emerald-200/80">
              Configure which roles are automatically assigned at specific levels
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Level Role
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-emerald-400/20">
              <DialogHeader>
                <DialogTitle className="text-white">Add Level Role</DialogTitle>
                <DialogDescription className="text-emerald-200/80">
                  Configure a role to be automatically assigned when users reach a specific level.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="level" className="text-emerald-200">
                    Level Required
                  </Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    value={newLevelRole.level}
                    onChange={(e) =>
                      setNewLevelRole((prev) => ({
                        ...prev,
                        level: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                    className="bg-white/5 border-emerald-400/20 text-white"
                    placeholder="Enter level..."
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-emerald-200">
                    Role to Assign
                  </Label>
                  <Select
                    value={newLevelRole.role_id}
                    onValueChange={(value) =>
                      setNewLevelRole((prev) => ({
                        ...prev,
                        role_id: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-emerald-400/20">
                      {availableRoles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getRoleColor(role.color) }}
                            />
                            <span className="text-white">{role.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateLevelRole} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Create Level Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {levelRoles.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-medium text-emerald-200 mb-2">No level roles configured</h3>
            <p className="text-emerald-200/60 mb-4">
              Set up automatic role assignments for users when they reach specific levels.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Level Role
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Level</TableHead>
                <TableHead className="text-emerald-200">Role</TableHead>
                <TableHead className="text-emerald-200">Role ID</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levelRoles
                .sort((a, b) => a.level - b.level)
                .map((levelRole) => (
                  <TableRow key={levelRole.id} className="border-emerald-400/20 hover:bg-white/5">
                    <TableCell>
                      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/20">
                        Level {levelRole.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getRoleColor(levelRole.role_color) }}
                        />
                        <span className="text-white font-medium">{levelRole.role_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-emerald-200/80 text-sm">{levelRole.role_id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-emerald-200/80 text-sm">
                        {new Date(levelRole.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLevelRole(levelRole.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
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
