import { SettingsForm } from "@/components/settings/settings-form"
import { GuildSettingsTable } from "@/components/settings/guild-settings-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-emerald-200/80">Configure bot settings and server preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white/5 border-emerald-400/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500/20">
            General
          </TabsTrigger>
          <TabsTrigger value="guilds" className="data-[state=active]:bg-emerald-500/20">
            Guild Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsForm />
        </TabsContent>

        <TabsContent value="guilds">
          <GuildSettingsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
