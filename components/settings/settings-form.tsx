"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function SettingsForm() {
  const [settings, setSettings] = useState({
    botName: "Minbot",
    prefix: "!",
    autoModeration: true,
    welcomeMessages: true,
    loggingEnabled: true,
    maintenanceMode: false,
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Bot Configuration</CardTitle>
          <CardDescription className="text-emerald-200/80">Configure basic bot settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="botName" className="text-emerald-200">
                Bot Name
              </Label>
              <Input
                id="botName"
                value={settings.botName}
                onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                className="bg-white/5 border-emerald-400/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix" className="text-emerald-200">
                Command Prefix
              </Label>
              <Input
                id="prefix"
                value={settings.prefix}
                onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                className="bg-white/5 border-emerald-400/20 text-white"
              />
            </div>
          </div>

          <Separator className="bg-emerald-400/20" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Features</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-200">Auto Moderation</Label>
                  <p className="text-sm text-emerald-300/60">Automatically moderate inappropriate content</p>
                </div>
                <Switch
                  checked={settings.autoModeration}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoModeration: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-200">Welcome Messages</Label>
                  <p className="text-sm text-emerald-300/60">Send welcome messages to new members</p>
                </div>
                <Switch
                  checked={settings.welcomeMessages}
                  onCheckedChange={(checked) => setSettings({ ...settings, welcomeMessages: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-200">Logging</Label>
                  <p className="text-sm text-emerald-300/60">Log all bot activities</p>
                </div>
                <Switch
                  checked={settings.loggingEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, loggingEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-emerald-200">Maintenance Mode</Label>
                  <p className="text-sm text-emerald-300/60">Disable bot for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
