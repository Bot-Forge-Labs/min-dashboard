import { RoleManagementPanel } from "@/components/roles/role-management-panel"

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
          Role Management
        </h1>
        <p className="text-emerald-200/80">Create, edit, and manage server roles and permissions.</p>
      </div>

      <RoleManagementPanel />
    </div>
  )
}
