import { LevelingDashboard } from "@/components/leveling/leveling-dashboard"

export default function LevelingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Leveling System</h2>
        <div className="flex items-center space-x-2">{/* Add any header actions here if needed */}</div>
      </div>
      <LevelingDashboard />
    </div>
  )
}
