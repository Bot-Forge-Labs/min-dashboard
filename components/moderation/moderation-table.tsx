"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Mock data - replace with actual database queries
const modLogs = [
  {
    id: 1,
    guild_id: "123456789012345678",
    user_id: "987654321098765432",
    user_username: "BadUser#1234",
    moderator_id: "111222333444555666",
    moderator_username: "ModeratorBot#0001",
    action: "ban",
    details: { reason: "Spamming", duration: null },
    created_at: "2024-01-10T15:30:00Z",
  },
  {
    id: 2,
    guild_id: "123456789012345678",
    user_id: "876543210987654321",
    user_username: "SpamUser#4321",
    moderator_id: "111222333444555666",
    moderator_username: "AutoMod#0000",
    action: "warn",
    details: { reason: "Inappropriate language", warning_count: 2 },
    created_at: "2024-01-10T14:15:00Z",
  },
  {
    id: 3,
    guild_id: "234567890123456789",
    user_id: "765432109876543210",
    user_username: "ToxicUser#9999",
    moderator_id: "222333444555666777",
    moderator_username: "AdminUser#5678",
    action: "timeout",
    details: { reason: "Harassment", duration: "1 hour" },
    created_at: "2024-01-10T12:45:00Z",
  },
]

export function ModerationTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = modLogs.filter(
    (log) =>
      log.user_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.moderator_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case "ban":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "kick":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "warn":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "timeout":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "unban":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Moderation Logs</CardTitle>
        <CardDescription className="text-slate-400">
          View all moderation actions taken across your servers
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search logs..."
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
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Action</TableHead>
              <TableHead className="text-slate-300">Moderator</TableHead>
              <TableHead className="text-slate-300">Reason</TableHead>
              <TableHead className="text-slate-300">Time</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell className="font-medium text-white">{log.user_username}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300">{log.moderator_username}</TableCell>
                <TableCell className="text-slate-300 max-w-xs truncate">
                  {log.details.reason || "No reason provided"}
                </TableCell>
                <TableCell className="text-slate-300">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
