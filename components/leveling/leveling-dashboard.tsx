"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LevelingSystemPanel } from "./leveling-system-panel"
import { LevelRoleConfiguration } from "./level-role-configuration"
import { XPSettings } from "./xp-settings"
import { XPLeaderboard } from "./xp-leaderboard"
import { AutoModerationIntegration } from "./auto-moderation-integration"
import { Award, Settings, Crown, Trophy, Shield, Server } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Guild {
  guild_id: string
  name: string
  icon?: string
}

export function LevelingDashboard() {
  const [selectedGuild, setSelectedGuild] = useState<string>("")
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuilds = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/guilds", { // Updated URL to match route.ts location
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DASHBOARD_API_KEY}`,
        },
      });

      console.log("API Response Status:", res.status);
      console.log("Response Headers:", Object.fromEntries(res.headers));
      const text = await res.text();
      console.log("Raw Response Body:", text);

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("API did not return valid JSON");
      }

      console.log("Parsed Guilds Data:", data);
      const fetchedGuilds = data.guilds || [];
      setGuilds(fetchedGuilds);

      if (!selectedGuild && fetchedGuilds.length > 0) {
        setSelectedGuild(fetchedGuilds[0].guild_id);
      }
    } catch (err) {
      console.error("Error fetching guilds:", err);
      setError(err.message || "Failed to fetch guilds");
      setGuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchGuilds();
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Leveling System</h1>
        </div>

        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-emerald-400" />
          <Select value={selectedGuild} onValueChange={setSelectedGuild} disabled={guilds.length === 0}>
            <SelectTrigger className="w-64 bg-white/5 border-emerald-400/20 text-white">
              <SelectValue placeholder="Select a server..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-emerald-400/20">
              {guilds.map((guild) => (
                <SelectItem key={guild.guild_id} value={guild.guild_id}>
                  <div className="flex items-center gap-2">
                    {guild.icon && (
                      <img
                        src={`https://cdn.discordapp.com/icons/${guild.guild_id}/${guild.icon}.png`}
                        alt={guild.name}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-white">{guild.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedGuild && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-emerald-400/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200"
            >
              <Award className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="level-roles"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200"
            >
              <Crown className="w-4 h-4 mr-2" />
              Level Roles
            </TabsTrigger>
            <TabsTrigger
              value="auto-moderation"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200"
            >
              <Shield className="w-4 h-4 mr-2" />
              Auto-Moderation
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <LevelingSystemPanel guildId={selectedGuild} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <XPLeaderboard guildId={selectedGuild} />
          </TabsContent>

          <TabsContent value="level-roles">
            <LevelRoleConfiguration guildId={selectedGuild} />
          </TabsContent>

          <TabsContent value="auto-moderation">
            <AutoModerationIntegration guildId={selectedGuild} />
          </TabsContent>

          <TabsContent value="settings">
            <XPSettings guildId={selectedGuild} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedGuild && guilds.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
          <h3 className="text-lg font-medium text-emerald-200 mb-2">No servers found</h3>
          <p className="text-emerald-200/60 mb-4">Make sure your bot is added to at least one server.</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <Button onClick={handleRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}