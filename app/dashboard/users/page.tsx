import { UsersTable } from "@/components/users/users-table"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-emerald-200/80">Manage server members and their roles.</p>
        </div>
        <Button className="bg-linear-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white/80">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <UsersTable />
    </div>
  )
}
