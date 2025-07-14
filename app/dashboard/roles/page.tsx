import { RoleManagementPanel } from "@/components/roles/role-management-panel"

const guildId = "1386840977188061194";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Role Management</h1>
        <p className="text-emerald-200/80 mt-2">
          Create, edit, and manage server roles and permissions.
        </p>
      </div>
      <RoleManagementPanel guildId={guildId} />
    </div>
  )
}
