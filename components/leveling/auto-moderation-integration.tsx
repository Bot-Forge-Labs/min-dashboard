"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, AlertTriangle, Clock, Save } from "lucide-react"
import { toast } from "sonner"

interface AutoModerationIntegrationProps {
  guildId: string
}

export function AutoModerationIntegration({ guildId }: AutoModerationIntegrationProps) {
  const [config, setConfig] = useState({
    enabled: false,
    xp_penalty_spam: 50,
    xp_penalty_toxicity: 100,
    xp_penalty_caps: 25,
    temporary_xp_freeze_duration: 300, // 5 minutes
    auto_role_removal_enabled: false,
    warning_threshold: 3,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/leveling/auto-moderation?guild_id=${guildId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || config)
      }
    } catch (error) {
      console.error("Error fetching auto-moderation config:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch("/api/leveling/auto-moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
        body: JSON.stringify({
          guild_id: guildId,
          ...config,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save auto-moderation settings")
      }

      toast.success("Auto-moderation settings saved successfully")
    } catch (error) {
      console.error("Error saving auto-moderation settings:", error)
      toast.error("Failed to save auto-moderation settings")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (guildId) {
      fetchConfig()
    }
  }, [guildId])

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-emerald-400/20 rounded w-3/4"></div>
            <div className="h-4 bg-emerald-400/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Auto-Moderation Integration
        </CardTitle>
        <CardDescription className="text-emerald-200/80">
          Automatically adjust XP based on user behavior and moderation actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-emerald-200 text-base">Enable Auto-Moderation</Label>
            <p className="text-sm text-emerald-200/60">Automatically penalize users for rule violations</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enabled: checked }))}
          />
        </div>

        {config.enabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spam-penalty" className="text-emerald-200">
                  Spam Penalty (XP)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <Input
                    id="spam-penalty"
                    type="number"
                    min="0"
                    max="1000"
                    value={config.xp_penalty_spam}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        xp_penalty_spam: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="toxicity-penalty" className="text-emerald-200">
                  Toxicity Penalty (XP)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <Input
                    id="toxicity-penalty"
                    type="number"
                    min="0"
                    max="1000"
                    value={config.xp_penalty_toxicity}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        xp_penalty_toxicity: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="caps-penalty" className="text-emerald-200">
                  Excessive Caps Penalty (XP)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <Input
                    id="caps-penalty"
                    type="number"
                    min="0"
                    max="1000"
                    value={config.xp_penalty_caps}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        xp_penalty_caps: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="freeze-duration" className="text-emerald-200">
                  XP Freeze Duration (seconds)
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <Input
                    id="freeze-duration"
                    type="number"
                    min="0"
                    max="3600"
                    value={config.temporary_xp_freeze_duration}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        temporary_xp_freeze_duration: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-emerald-200 text-base">Auto Role Removal</Label>
                <p className="text-sm text-emerald-200/60">Automatically remove level roles for severe violations</p>
              </div>
              <Switch
                checked={config.auto_role_removal_enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    auto_role_removal_enabled: checked,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="warning-threshold" className="text-emerald-200">
                Warning Threshold
              </Label>
              <Input
                id="warning-threshold"
                type="number"
                min="1"
                max="10"
                value={config.warning_threshold}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    warning_threshold: Number.parseInt(e.target.value) || 1,
                  }))
                }
                className="bg-white/5 border-emerald-400/20 text-white mt-1"
              />
              <p className="text-xs text-emerald-200/60 mt-1">Number of warnings before severe penalties apply</p>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
