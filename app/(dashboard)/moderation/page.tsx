import { ModerationTable } from "@/components/moderation/moderation-table"
import { PunishmentsTable } from "@/components/moderation/punishments-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Moderation</h1>
        <p className="text-slate-400">View moderation logs and manage punishments.</p>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">
            Mod Logs
          </TabsTrigger>
          <TabsTrigger value="punishments" className="data-[state=active]:bg-slate-700">
            Punishments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <ModerationTable />
        </TabsContent>

        <TabsContent value="punishments">
          <PunishmentsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
