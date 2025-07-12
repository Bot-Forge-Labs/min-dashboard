import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getServerOverview } from "@/lib/supabase/queries"
import { Server } from "lucide-react"

export async function ServerOverview() {
  const servers = await getServerOverview()

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Server Overview</CardTitle>
        <CardDescription className="text-emerald-200/80">Your most active servers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {servers.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
            <p className="text-emerald-200/60 mb-2">No servers found</p>
            <p className="text-sm text-emerald-300/40">
              Configure your Supabase connection and add servers to see them here
            </p>
          </div>
        ) : (
          servers.map((server) => (
            <div key={server.guild_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{server.name}</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    active
                  </Badge>
                </div>
                <span className="text-sm text-emerald-200/70">Connected</span>
              </div>
              <Progress value={85} className="h-2 bg-white/10" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
