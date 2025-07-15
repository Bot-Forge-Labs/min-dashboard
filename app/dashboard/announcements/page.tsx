import { AnnouncementsTable } from "@/components/announcements/announcements-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Announcements</h1>
          <p className="text-slate-400">Create and manage server announcements.</p>
        </div>
        {/* <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button> */}
      </div>

      <AnnouncementsTable />
    </div>
  )
}
