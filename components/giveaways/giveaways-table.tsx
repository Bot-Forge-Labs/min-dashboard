"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, Loader2, RefreshCw, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Giveaway } from "@/lib/types/database"
import { toast } from "sonner"

export function GiveawaysTable() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchGiveaways = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { data, error } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching giveaways:", error)
        toast.error("Failed to fetch giveaways")
        return
      }

      setGiveaways(data || [])
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} giveaways`)
      }
    } catch (error) {
      console.error("Error fetching giveaways:", error)
      toast.error("Failed to connect to database")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGiveaways()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchGiveaways()
  }

  const handleDeleteGiveaway = async (giveawayId: number) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("giveaways").delete().eq("id", giveawayId)

      if (error) {
        console.error("Error deleting giveaway:", error)
        toast.error("Failed to delete giveaway")
        return
      }

      toast.success("Giveaway deleted successfully")
      fetchGiveaways() // Refresh the list
    } catch (error) {
      console.error("Error deleting giveaway:", error)
      toast.error("Failed to delete giveaway")
    }
  }

  const handleEndGiveaway = async (giveawayId: number) => {
    try {
      const supabase = createClient()
      if (!supabase) {
        toast.error("Supabase client not available")
        return
      }

      const { error } = await supabase.from("giveaways").update({ ended: true }).eq("id", giveawayId)

      if (error) {
        console.error("Error ending giveaway:", error)
        toast.error("Failed to end giveaway")
        return
      }

      toast.success("Giveaway ended successfully")
      fetchGiveaways() // Refresh the list
    } catch (error) {
      console.error("Error ending giveaway:", error)
      toast.error("Failed to end giveaway")
    }
  }

  const filteredGiveaways = giveaways.filter(
    (giveaway) =>
      giveaway.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.description.toLowerCase().includes(searchTerm.toLowerCase()),
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

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-200/80">Loading giveaways...</p>
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
            <CardTitle className="text-white">Giveaways</CardTitle>
            <CardDescription className="text-emerald-200/80">Manage server giveaways and track winners</CardDescription>
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
              placeholder="Search giveaways..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredGiveaways.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-200/60 mb-2">
              {searchTerm ? "No giveaways found matching your search." : "No giveaways found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">Giveaways will appear here when they are created.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Prize</TableHead>
                <TableHead className="text-emerald-200">Winners</TableHead>
                <TableHead className="text-emerald-200">Created By</TableHead>
                <TableHead className="text-emerald-200">Duration</TableHead>
                <TableHead className="text-emerald-200">End Time</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiveaways.map((giveaway) => (
                <TableRow key={giveaway.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{giveaway.prize}</div>
                      <div className="text-sm text-emerald-300/60 max-w-xs truncate">{giveaway.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-200">{giveaway.winners_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">{giveaway.created_by}</TableCell>
                  <TableCell className="text-emerald-200/80">
                    {giveaway.duration_minutes ? `${giveaway.duration_minutes} min` : "N/A"}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
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
                          View Details
                        </DropdownMenuItem>
                        {!giveaway.ended && new Date(giveaway.end_time) > new Date() && (
                          <DropdownMenuItem
                            className="text-yellow-400 hover:bg-yellow-500/10"
                            onClick={() => handleEndGiveaway(giveaway.id)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            End Early
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteGiveaway(giveaway.id)}
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
