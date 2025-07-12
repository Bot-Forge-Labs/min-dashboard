"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data - replace with actual database queries
const reactionRoles = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    guild_id: "123456789012345678",
    channel_id: "987654321098765432",
    message_id: "111222333444555666",
    emoji: "🎮",
    role_id: "777888999000111222",
    created_at: "2024-01-10T15:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    guild_id: "123456789012345678",
    channel_id: "987654321098765432",
    message_id: "111222333444555666",
    emoji: "🎨",
    role_id: "777888999000111223",
    created_at: "2024-01-10T15:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    guild_id: "234567890123456789",
    channel_id: "876543210987654321",
    message_id: "222333444555666777",
    emoji: "🎵",
    role_id: "777888999000111224",
    created_at: "2024-01-09T12:15:00Z",
  },
]

const reactionRoleEmbeds = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    guild_id: "123456789012345678",
    channel_id: "987654321098765432",
    message_id: "111222333444555666",
    title: "Choose Your Roles",
    description: "React to get your preferred roles!",
    color: "#5865F2",
    footer_text: "Role Selection",
    footer_icon: null,
    author_id: "AdminUser#5678",
    created_at: "2024-01-10T15:30:00Z",
    updated_at: "2024-01-10T15:30:00Z",
  },
]

export function ReactionRolesTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredReactionRoles = reactionRoles.filter(
    (role) =>
      role.emoji.includes(searchTerm) || role.role_id.includes(searchTerm) || role.guild_id.includes(searchTerm),
  )

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Reaction Roles</CardTitle>
        <CardDescription className="text-slate-400">Manage reaction role assignments and embeds</CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search reaction roles..."
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
              <TableHead className="text-slate-300">Emoji</TableHead>
              <TableHead className="text-slate-300">Role ID</TableHead>
              <TableHead className="text-slate-300">Message ID</TableHead>
              <TableHead className="text-slate-300">Guild ID</TableHead>
              <TableHead className="text-slate-300">Created</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReactionRoles.map((role) => (
              <TableRow key={role.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell className="text-2xl">{role.emoji}</TableCell>
                <TableCell className="font-mono text-slate-300">{role.role_id}</TableCell>
                <TableCell className="font-mono text-slate-300">{role.message_id}</TableCell>
                <TableCell className="font-mono text-slate-300">{role.guild_id}</TableCell>
                <TableCell className="text-slate-300">
                  {formatDistanceToNow(new Date(role.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
