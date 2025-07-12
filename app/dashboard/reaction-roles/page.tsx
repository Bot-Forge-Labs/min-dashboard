import { ReactionRolesTable } from "@/components/reaction-roles/reaction-roles-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ReactionRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reaction Roles</h1>
          <p className="text-slate-400">Set up reaction roles for your servers.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Reaction Role
        </Button>
      </div>

      <ReactionRolesTable />
    </div>
  )
}
