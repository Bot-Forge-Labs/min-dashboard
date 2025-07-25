import  LevelingDashboard  from "@/components/leveling/leveling-dashboard"

export default function LevelingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Leveling System
          </h1>
          <p className="text-emerald-200/80">Manage XP, levels, and rewards for your Discord server.</p>
        </div>
      </div>
      <LevelingDashboard />
    </div>
  )
}
