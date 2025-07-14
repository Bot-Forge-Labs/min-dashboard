import { ServersTable } from "@/components/servers/servers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ServersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Servers
          </h1>
          <p className="text-emerald-200/80">Manage your Discord servers and their settings.</p>
        </div>
        <Button className="bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
          <Plus className="w-4 h-4 mr-2" />
          Add Server
        </Button>
      </div>

      <ServersTable />
    </div>
  )
}
