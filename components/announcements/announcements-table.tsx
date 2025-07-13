"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Announcement } from "@/lib/types/database"
import { toast } from "sonner"

export function AnnouncementsTable() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnnouncements = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching announcements:", error)
        toast.error("Failed to fetch announcements")
        return
      }

      setAnnouncements(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} announcements`)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnnouncements()
  }

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("announcements").delete().eq("id", announcementId)

      if (error) {
        console.error("Error deleting announcement:", error)
        toast.error("Failed to delete announcement")
        return
      }

      toast.success("Announcement deleted successfully")
      fetchAnnouncements() // Refresh the list
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error("Failed to delete announcement")
    }
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.created_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading announcements...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Announcements</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage server announcements and embedded messages
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No announcements found matching your search." : "No announcements found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">Announcements will appear here when they are created.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Title</TableHead>
                <TableHead className="text-emerald-200">Content</TableHead>
                <TableHead className="text-emerald-200">Channel</TableHead>
                <TableHead className="text-emerald-200">Created By</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200">Color</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell className="font-medium text-white max-w-xs">{announcement.title}</TableCell>
                  <TableCell className="text-emerald-200/80 max-w-md truncate">{announcement.content}</TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">{announcement.channel_id}</TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">{announcement.created_by}</TableCell>
                  <TableCell className="text-emerald-200/80">
                    {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded border border-emerald-400/20"
                      style={{
                        backgroundColor: announcement.embed_color
                          ? `#${announcement.embed_color.toString(16).padStart(6, "0")}`
                          : "#8be2b9",
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
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
        )}
      </CardContent>
    </Card>
  )
}
