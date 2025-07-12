"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

// Mock data - replace with actual database queries
const giveaways = [
  {
    id: 1,
    prize: "Discord Nitro (1 Month)",
    description: "Win a month of Discord Nitro!",
    start_time: "2024-01-10T10:00:00Z",
    end_time: "2024-01-17T10:00:00Z",
    winners_count: 1,
    created_by: "AdminUser#5678",
    channel_id: "123456789012345678",
    message_id: "987654321098765432",
    ended: false,
    created_at: "2024-01-10T09:45:00Z",
    duration_minutes: 10080,
  },
  {
    id: 2,
    prize: "Steam Gift Card ($50)",
    description: "Get a $50 Steam gift card to buy your favorite games!",
    start_time: "2024-01-08T15:00:00Z",
    end_time: "2024-01-10T15:00:00Z",
    winners_count: 2,
    created_by: "ModeratorBot#0001",
    channel_id: "234567890123456789",
    message_id: "876543210987654321",
    ended: true,
    created_at: "2024-01-08T14:30:00Z",
    duration_minutes: 2880,
  },
  {
    id: 3,
    prize: "Custom Discord Bot",
    description: "Win a custom Discord bot for your server!",
    start_time: "2024-01-12T12:00:00Z",
    end_time: "2024-01-19T12:00:00Z",
    winners_count: 1,
    created_by: "StaffMember#9999",
    channel_id: "345678901234567890",
    message_id: "765432109876543210",
    ended: false,
    created_at: "2024-01-12T11:45:00Z",
    duration_minutes: 10080,
  },
]

export function GiveawaysTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGiveaways = giveaways.filter(
    (giveaway) =>
      giveaway.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (ended: boolean, endTime: string) => {
    if (ended) return "bg-red-500/10 text-red-400 border-red-500/20"
    if (new Date(endTime) < new Date()) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    return "bg-green-500/10 text-green-400 border-green-500/20"
  }

  const getStatus = (ended: boolean, endTime: string) => {
    if (ended) return "Ended"
    if (new Date(endTime) < new Date()) return "Expired"
    return "Active"
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Giveaways</CardTitle>
        <CardDescription className="text-slate-400">Manage server giveaways and track winners</CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search giveaways..."
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
              <TableHead className="text-slate-300">Prize</TableHead>
              <TableHead className="text-slate-300">Winners</TableHead>
              <TableHead className="text-slate-300">Created By</TableHead>
              <TableHead className="text-slate-300">End Time</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGiveaways.map((giveaway) => (
              <TableRow key={giveaway.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell>
                  <div>
                    <div className="font-medium text-white">{giveaway.prize}</div>
                    <div className="text-sm text-slate-400 max-w-xs truncate">{giveaway.description}</div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300">{giveaway.winners_count}</TableCell>
                <TableCell className="text-slate-300">{giveaway.created_by}</TableCell>
                <TableCell className="text-slate-300">
                  {formatDistanceToNow(new Date(giveaway.end_time), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(giveaway.ended, giveaway.end_time)}>
                    {getStatus(giveaway.ended, giveaway.end_time)}
                  </Badge>
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
                        View Details
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
