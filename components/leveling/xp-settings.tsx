"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings, Zap, Clock, MessageSquare, Hash, Shield, Save, RefreshCw } from "lucide-react"
import type { LevelingConfig } from "@/types/leveling"
import { toast } from "sonner"

interface XPSettingsProps {
  guildId: string
}

export function XPSettings({ guildId }: XPSettingsProps) {
  const [config, setConfig] = useState<LevelingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch leveling config
      const configResponse = await fetch(`/api/leveling/config?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfig(
          configData.config || {
            guild_id: guildId,
            enabled: true,
            xp_per_message: 15,
            xp_cooldown: 60,
            level_up_message:
              "🎉 Congratulations {user-mention}! You've reached **Level {level}**! You now have **{total-xp}** total XP!",
            no_xp_roles: [],
            no_xp_channels: [],
          },
        )
      }

      // Fetch channels and roles for dropdowns
      const [channelsResponse, rolesResponse] = await Promise.all([
        fetch(`/api/channels?guild_id=${guildId}`, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}` },
        }),
        fetch(`/api/roles?guild_id=${guildId}`, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}` },
        }),
      ])

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json()
        setChannels(channelsData.channels || [])
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData.roles || [])
      }

      toast.success("XP settings loaded")
    } catch (error) {
      console.error("Error fetching XP settings:", error)
      toast.error("Failed to fetch XP settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    try {
      setSaving(true)

      const response = await fetch("/api/leveling/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Failed to save XP settings")
      }

      toast.success("XP settings saved successfully")
    } catch (error) {
      console.error("Error saving XP settings:", error)
      toast.error("Failed to save XP settings")
    } finally {
      setSaving(false)
    }
  }

  const placeholders = [
    { placeholder: "{user-mention}", description: "Mentions the user (@username)" },
    { placeholder: "{user-name}", description: "User's display name" },
    { placeholder: "{user-id}", description: "User's Discord ID" },
    { placeholder: "{level}", description: "New level reached" },
    { placeholder: "{previous-level}", description: "Previous level" },
    { placeholder: "{xp}", description: "Current level XP" },
    { placeholder: "{total-xp}", description: "Total XP accumulated" },
    { placeholder: "{xp-needed}", description: "XP needed for next level" },
    { placeholder: "{server-name}", description: "Server name" },
  ]

  useEffect(() => {
    if (guildId) {
      fetchData()
    }
  }, [guildId])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic XP Settings
          </CardTitle>
          <CardDescription className="text-emerald-200/80">Configure core leveling system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-emerald-200 text-base">Enable Leveling System</Label>
              <p className="text-sm text-emerald-200/60">Turn the entire leveling system on or off for this server</p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig((prev) => (prev ? { ...prev, enabled: checked } : null))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="xp-per-message" className="text-emerald-200">
                XP Per Message
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="h-4 w-4 text-emerald-400" />
                <Input
                  id="xp-per-message"
                  type="number"
                  min="1"
                  max="100"
                  value={config.xp_per_message}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            xp_per_message: Number.parseInt(e.target.value) || 15,
                          }
                        : null,
                    )
                  }
                  className="bg-white/5 border-emerald-400/20 text-white"
                />
              </div>
              <p className="text-xs text-emerald-200/60 mt-1">Amount of XP users gain per message (1-100)</p>
            </div>

            <div>
              <Label htmlFor="xp-cooldown" className="text-emerald-200">
                XP Cooldown (seconds)
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-emerald-400" />
                <Input
                  id="xp-cooldown"
                  type="number"
                  min="0"
                  max="3600"
                  value={config.xp_cooldown}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            xp_cooldown: Number.parseInt(e.target.value) || 60,
                          }
                        : null,
                    )
                  }
                  className="bg-white/5 border-emerald-400/20 text-white"
                />
              </div>
              <p className="text-xs text-emerald-200/60 mt-1">Cooldown between XP gains (0-3600 seconds)</p>
            </div>
          </div>

          <div>
            <Label htmlFor="level-up-channel" className="text-emerald-200">
              Level Up Announcement Channel
            </Label>
            <Select
              value={config.level_up_channel_id || "default"}
              onValueChange={(value) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        level_up_channel_id: value === "default" ? undefined : value,
                      }
                    : null,
                )
              }
            >
              <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white mt-1">
                <SelectValue placeholder="Select channel (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-emerald-400/20">
                <SelectItem value="default">No announcement channel</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span className="text-white">{channel.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-emerald-200/60 mt-1">
              Channel where level up messages will be sent (leave empty to disable)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Message */}
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Level Up Message
          </CardTitle>
          <CardDescription className="text-emerald-200/80">
            Customize the message sent when users level up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="level-up-message" className="text-emerald-200">
              Message Template
            </Label>
            <Textarea
              id="level-up-message"
              value={config.level_up_message}
              onChange={(e) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        level_up_message: e.target.value,
                      }
                    : null,
                )
              }
              className="bg-white/5 border-emerald-400/20 text-white mt-1 min-h-[100px]"
              placeholder="Enter your level up message..."
            />
            <p className="text-xs text-emerald-200/60 mt-1">Supports Discord markdown formatting and placeholders</p>
          </div>

          <div>
            <h4 className="text-emerald-200 font-medium mb-2">Available Placeholders</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {placeholders.map((item) => (
                <div
                  key={item.placeholder}
                  className="flex items-center justify-between p-2 bg-white/5 rounded border border-emerald-400/10"
                >
                  <code className="text-emerald-300 text-sm">{item.placeholder}</code>
                  <span className="text-xs text-emerald-200/60">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restrictions */}
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            XP Restrictions
          </CardTitle>
          <CardDescription className="text-emerald-200/80">
            Configure roles and channels that don't gain XP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-emerald-200">Roles That Don't Gain XP</Label>
            <div className="mt-2 space-y-2">
              {config.no_xp_roles.map((roleId) => {
                const role = roles.find((r) => r.role_id === roleId)
                return (
                  <Badge key={roleId} variant="secondary" className="bg-red-500/20 text-red-200 border-red-400/20">
                    {role?.name || roleId}
                    <button
                      onClick={() =>
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                no_xp_roles: prev.no_xp_roles.filter((id) => id !== roleId),
                              }
                            : null,
                        )
                      }
                      className="ml-2 hover:text-red-100"
                    >
                      ×
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select
              onValueChange={(value) => {
                if (value && !config.no_xp_roles.includes(value)) {
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          no_xp_roles: [...prev.no_xp_roles, value],
                        }
                      : null,
                  )
                }
              }}
            >
              <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white mt-2">
                <SelectValue placeholder="Add role to exclude from XP..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-emerald-400/20">
                {roles
                  .filter((role) => !config.no_xp_roles.includes(role.role_id))
                  .map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#99AAB5",
                          }}
                        />
                        <span className="text-white">{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-emerald-200">Channels That Don't Give XP</Label>
            <div className="mt-2 space-y-2">
              {config.no_xp_channels.map((channelId) => {
                const channel = channels.find((c) => c.id === channelId)
                return (
                  <Badge key={channelId} variant="secondary" className="bg-red-500/20 text-red-200 border-red-400/20">
                    #{channel?.name || channelId}
                    <button
                      onClick={() =>
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                no_xp_channels: prev.no_xp_channels.filter((id) => id !== channelId),
                              }
                            : null,
                        )
                      }
                      className="ml-2 hover:text-red-100"
                    >
                      ×
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select
              onValueChange={(value) => {
                if (value && !config.no_xp_channels.includes(value)) {
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          no_xp_channels: [...prev.no_xp_channels, value],
                        }
                      : null,
                  )
                }
              }}
            >
              <SelectTrigger className="bg-white/5 border-emerald-400/20 text-white mt-2">
                <SelectValue placeholder="Add channel to exclude from XP..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-emerald-400/20">
                {channels
                  .filter((channel) => !config.no_xp_channels.includes(channel.id))
                  .map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-white">{channel.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
