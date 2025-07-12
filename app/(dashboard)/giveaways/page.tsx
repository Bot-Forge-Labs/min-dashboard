import { GiveawaysTable } from "@/components/giveaways/giveaways-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function GiveawaysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Giveaways</h1>
          <p className="text-slate-400">Create and manage server giveaways.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Giveaway
        </Button>
      </div>

      <GiveawaysTable />
    </div>
  )
}
