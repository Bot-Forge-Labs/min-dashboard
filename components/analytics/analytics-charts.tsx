"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function AnalyticsCharts() {
  const commandCategories = [
    { name: "Moderation", usage: 45, color: "bg-red-500" },
    { name: "Utility", usage: 30, color: "bg-blue-500" },
    { name: "Fun", usage: 15, color: "bg-purple-500" },
    { name: "General", usage: 10, color: "bg-emerald-500" },
  ]

  const serverActivity = [
    { server: "Gaming Community", activity: 85 },
    { server: "Tech Support Hub", activity: 72 },
    { server: "Art & Design", activity: 58 },
    { server: "Music Lovers", activity: 43 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Command Usage by Category</CardTitle>
          <CardDescription className="text-emerald-200/80">Distribution of command usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {commandCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-200">{category.name}</span>
                <span className="text-emerald-300/60">{category.usage}%</span>
              </div>
              <Progress value={category.usage} className="h-2 bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Server Activity</CardTitle>
          <CardDescription className="text-emerald-200/80">Activity levels across servers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverActivity.map((server) => (
            <div key={server.server} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-200">{server.server}</span>
                <span className="text-emerald-300/60">{server.activity}%</span>
              </div>
              <Progress value={server.activity} className="h-2 bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
