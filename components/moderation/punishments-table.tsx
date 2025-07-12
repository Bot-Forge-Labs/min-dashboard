"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock data - replace with actual database queries
const punishments = [
  {
    id: 1,
    user_id: "987654321098765432",
    moderator_id: "111222333444555666",
    command_name: "ban",
    reason: "Repeated violations of server rules",
    issued_at: "2024-01-10T15:30:00Z",
    expires_at: null,
    active: true,
  },
  {
    id: 2,
    user_id: "876543210987654321",
    moderator_id: "111222333444555666",
    command_name: "timeout",
    reason: "Inappropriate language",
    issued_at: "2024-01-10T14:15:00Z",
    expires_at: "2024-01-11T14:15:00Z",
    active: true,
  },
  {
    id: 3,
    user_id: "765432109876543210",
    moderator_id: "222333444555666777",
    command_name: "warn",
    reason: "Minor rule violation",
    issued_at: "2024-01-09T12:45:00Z",
    expires_at: "2024-01-16T12:45:00Z",
    active: false,
  },
]

export function PunishmentsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPunishments = punishments.filter(
    (punishment) =>
      punishment.user_id.includes(searchTerm) ||
      punishment.command_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      punishment.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCommandColor = (command: string) => {
    switch (command) {
      case "ban":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "kick":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "warn":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "timeout":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Active Punishments</CardTitle>
        <CardDescription className="text-slate-400">Manage active punishments and their expiration</CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search punishments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-300">User ID</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Reason</TableHead>
              <TableHead className="text-slate-300">Issued</TableHead>
              <TableHead className="text-slate-300">Expires</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPunishments.map((punishment) => (
              <TableRow key={punishment.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell className="font-mono text-white">{punishment.user_id}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getCommandColor(punishment.command_name)}>
                    {punishment.command_name}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300 max-w-xs truncate">{punishment.reason}</TableCell>
                <TableCell className="text-slate-300">
                  {formatDistanceToNow(new Date(punishment.issued_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-slate-300">
                  {punishment.expires_at
                    ? formatDistanceToNow(new Date(punishment.expires_at), { addSuffix: true })
                    : "Permanent"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      punishment.active
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-green-500/10 text-green-400 border-green-500/20"
                    }
                  >
                    {punishment.active ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {punishment.active && (
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
