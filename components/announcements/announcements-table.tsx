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
const announcements = [
  {
    id: 1,
    channel_id: "123456789012345678",
    title: "Server Update v2.0",
    content: "We've updated our server with new features and improvements!",
    embed_color: 5793266,
    image_url: null,
    thumbnail_url: null,
    footer_text: "Bot Team",
    created_at: "2024-01-10T15:30:00Z",
    created_by: "AdminUser#5678",
  },
  {
    id: 2,
    channel_id: "234567890123456789",
    title: "New Giveaway Event",
    content: "Join our monthly giveaway for a chance to win amazing prizes!",
    embed_color: 15844367,
    image_url: "/placeholder.svg?height=200&width=400",
    thumbnail_url: null,
    footer_text: "Events Team",
    created_at: "2024-01-09T12:15:00Z",
    created_by: "EventBot#1234",
  },
  {
    id: 3,
    channel_id: "345678901234567890",
    title: "Community Guidelines Update",
    content: "Please review our updated community guidelines to ensure a positive environment for everyone.",
    embed_color: 16711680,
    image_url: null,
    thumbnail_url: null,
    footer_text: "Moderation Team",
    created_at: "2024-01-08T09:45:00Z",
    created_by: "ModeratorBot#0001",
  },
]

export function AnnouncementsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Announcements</CardTitle>
        <CardDescription className="text-slate-400">Manage server announcements and embedded messages</CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search announcements..."
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
              <TableHead className="text-slate-300">Title</TableHead>
              <TableHead className="text-slate-300">Content</TableHead>
              <TableHead className="text-slate-300">Created By</TableHead>
              <TableHead className="text-slate-300">Created</TableHead>
              <TableHead className="text-slate-300">Color</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnnouncements.map((announcement) => (
              <TableRow key={announcement.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell className="font-medium text-white max-w-xs">{announcement.title}</TableCell>
                <TableCell className="text-slate-300 max-w-md truncate">{announcement.content}</TableCell>
                <TableCell className="text-slate-300">{announcement.created_by}</TableCell>
                <TableCell className="text-slate-300">
                  {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div
                    className="w-6 h-6 rounded border border-slate-600"
                    style={{ backgroundColor: `#${announcement.embed_color.toString(16).padStart(6, "0")}` }}
                  />
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
