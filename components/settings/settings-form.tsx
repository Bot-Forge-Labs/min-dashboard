"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Save, RefreshCw, User, Settings, Shield, Bell } from "lucide-react"

interface UserProfile {
  id: string
  username: string
  discriminator: string
  avatar: string
  banner?: string
  roles: string[]
  messageCount: number
  joinedAt: string
}

interface BotSettings {
  botName: string
  autoModeration: boolean
  welcomeMessages: boolean
  loggingEnabled: boolean
  maintenanceMode: boolean
  antiSpam: boolean
  autoRole: boolean
  levelingSystem: boolean
}

export function SettingsForm() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<BotSettings>({
    botName: "Minbot",
    autoModeration: true,
    welcomeMessages: true,
    loggingEnabled: true,
    maintenanceMode: false,
    antiSpam: true,
    autoRole: false,
    levelingSystem: true,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchBotSettings()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // This would typically fetch from your auth system or Discord API
      // For now, we'll use mock data
      setUserProfile({
        id: "123456789012345678",
        username: "DashboardUser",
        discriminator: "1234",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        banner: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop",
        roles: ["Administrator", "Moderator", "VIP"],
        messageCount: 1250,
        joinedAt: "2023-01-15T10:30:00Z",
      })
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchBotSettings = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      // Fetch bot settings from database
      const { data, error } = await supabase.from("bot_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching bot settings:", error)
      } else if (data) {
        setSettings({
          botName: data.bot_name || "Minbot",
          autoModeration: data.auto_moderation || false,
          welcomeMessages: data.welcome_messages || false,
          loggingEnabled: data.logging_enabled || false,
          maintenanceMode: data.maintenance_mode || false,
          antiSpam: data.anti_spam || false,
          autoRole: data.auto_role || false,
          levelingSystem: data.leveling_system || false,
        })
      }
    } catch (error) {
      console.error("Error fetching bot settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Database connection failed")
        return
      }

      const { error } = await supabase.from("bot_settings").upsert({
        id: 1,
        bot_name: settings.botName,
        auto_moderation: settings.autoModeration,
        welcome_messages: settings.welcomeMessages,
        logging_enabled: settings.loggingEnabled,
        maintenance_mode: settings.maintenanceMode,
        anti_spam: settings.antiSpam,
        auto_role: settings.autoRole,
        leveling_system: settings.levelingSystem,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving settings:", error)
        toast.error("Failed to save settings")
        return
      }

      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof BotSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-emerald-400/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-emerald-400/20 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white/5 border-emerald-400/20">
          <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-500/20">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="bot" className="data-[state=active]:bg-emerald-500/20">
            <Settings className="w-4 h-4 mr-2" />
            Bot Settings
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-emerald-500/20">
            <Shield className="w-4 h-4 mr-2" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-500/20">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">User Profile</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Your Discord profile information and server activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile && (
                <div>
                  {/* Profile Banner */}
                  <div className="relative">
                    <div
                      className="h-32 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600"
                      style={{
                        backgroundImage: userProfile.banner ? `url(${userProfile.banner})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Avatar className="absolute -bottom-8 left-6 w-16 h-16 border-4 border-white/20">
                      <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.username} />
                      <AvatarFallback className="bg-emerald-600 text-white">
                        {userProfile.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-8 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {userProfile.username}#{userProfile.discriminator}
                      </h3>
                      <p className="text-emerald-200/80">User ID: {userProfile.id}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="text-2xl font-bold text-white">{userProfile.messageCount}</div>
                        <div className="text-sm text-emerald-200/80">Messages Sent</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="text-2xl font-bold text-white">{userProfile.roles.length}</div>
                        <div className="text-sm text-emerald-200/80">Roles</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="text-2xl font-bold text-white">
                          {Math.floor((Date.now() - new Date(userProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-emerald-200/80">Days Active</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg border border-emerald-400/20">
                        <div className="text-2xl font-bold text-white">A+</div>
                        <div className="text-sm text-emerald-200/80">Activity Grade</div>
                      </div>
                    </div>

                    {/* Roles */}
                    <div>
                      <Label className="text-emerald-200 text-base font-medium">Your Roles</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userProfile.roles.map((role, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div>
                      <Label className="text-emerald-200 text-base font-medium">Member Since</Label>
                      <p className="text-white mt-1">
                        {new Date(userProfile.joinedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Bot Configuration</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Configure basic bot settings and features
              </CardDescription>
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
                    onChange={(e) => updateSetting("botName", e.target.value)}
                    className="bg-white/5 border-emerald-400/20 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-emerald-400/20" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Auto Moderation</Label>
                      <p className="text-sm text-emerald-300/60">Automatically moderate inappropriate content</p>
                    </div>
                    <Switch
                      checked={settings.autoModeration}
                      onCheckedChange={(checked) => updateSetting("autoModeration", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Welcome Messages</Label>
                      <p className="text-sm text-emerald-300/60">Send welcome messages to new members</p>
                    </div>
                    <Switch
                      checked={settings.welcomeMessages}
                      onCheckedChange={(checked) => updateSetting("welcomeMessages", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Logging</Label>
                      <p className="text-sm text-emerald-300/60">Log all bot activities and moderation actions</p>
                    </div>
                    <Switch
                      checked={settings.loggingEnabled}
                      onCheckedChange={(checked) => updateSetting("loggingEnabled", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Anti-Spam</Label>
                      <p className="text-sm text-emerald-300/60">Prevent spam messages and raids</p>
                    </div>
                    <Switch
                      checked={settings.antiSpam}
                      onCheckedChange={(checked) => updateSetting("antiSpam", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Auto Role</Label>
                      <p className="text-sm text-emerald-300/60">Automatically assign roles to new members</p>
                    </div>
                    <Switch
                      checked={settings.autoRole}
                      onCheckedChange={(checked) => updateSetting("autoRole", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-emerald-200">Leveling System</Label>
                      <p className="text-sm text-emerald-300/60">Enable XP and leveling for active members</p>
                    </div>
                    <Switch
                      checked={settings.levelingSystem}
                      onCheckedChange={(checked) => updateSetting("levelingSystem", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-400/20" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">System Settings</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-emerald-200">Maintenance Mode</Label>
                    <p className="text-sm text-emerald-300/60">Disable bot for maintenance (admin only)</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Moderation Settings</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Configure moderation rules and automatic actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-emerald-200/60">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced moderation settings will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-emerald-200/80">
                Manage your notification settings and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-emerald-200/60">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Notification preferences will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
