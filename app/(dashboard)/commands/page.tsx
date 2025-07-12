import { CommandsTable } from "@/components/commands/commands-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CommandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Commands
          </h1>
          <p className="text-emerald-200/80">Manage bot commands, permissions, and usage statistics.</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Command
        </Button>
      </div>

      <CommandsTable />
    </div>
  )
}
