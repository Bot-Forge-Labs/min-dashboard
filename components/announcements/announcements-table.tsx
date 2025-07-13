"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Megaphone, User, Calendar, Hash, Trash2, Loader2, RefreshCw } from "lucide-react"
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

      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

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
      fetchAnnouncements()
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error("Failed to delete announcement")
    }
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.created_by.includes(searchTerm) ||
      announcement.channel_id.includes(searchTerm),
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
            <CardDescription className="text-emerald-200/80">Manage server announcements and messages</CardDescription>
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
              <p className="text-sm text-emerald-300/40">Server announcements will appear here when created.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Title</TableHead>
                <TableHead className="text-emerald-200">Content</TableHead>
                <TableHead className="text-emerald-200">Channel</TableHead>
                <TableHead className="text-emerald-200">Creator</TableHead>
                <TableHead className="text-emerald-200">Color</TableHead>
                <TableHead className="text-emerald-200">Created</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-emerald-400/60" />
                      <p className="font-medium text-white">{announcement.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-emerald-200/80 max-w-xs truncate">{announcement.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-emerald-400/60" />
                      <p className="font-medium text-white font-mono text-sm">{announcement.channel_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400/60" />
                      <p className="font-medium text-white font-mono text-sm">{announcement.created_by}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {announcement.embed_color ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-emerald-400/20"
                          style={{
                            backgroundColor: `#${announcement.embed_color.toString(16).padStart(6, "0")}`,
                          }}
                        />
                        <span className="font-mono text-emerald-200/80 text-sm">
                          #{announcement.embed_color.toString(16).padStart(6, "0")}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-emerald-200/80">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-sm">{new Date(announcement.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-emerald-200/60">
                          {new Date(announcement.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
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
