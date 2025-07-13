"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Gift, User, Calendar, Clock, Trophy, Trash2, StopCircle, Loader2, RefreshCw } from "lucide-react"
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

      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

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
      fetchGiveaways()
    } catch (error) {
      console.error("Error ending giveaway:", error)
      toast.error("Failed to end giveaway")
    }
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
      fetchGiveaways()
    } catch (error) {
      console.error("Error deleting giveaway:", error)
      toast.error("Failed to delete giveaway")
    }
  }

  const isGiveawayActive = (giveaway: Giveaway) => {
    return !giveaway.ended && new Date(giveaway.end_time) > new Date()
  }

  const filteredGiveaways = giveaways.filter(
    (giveaway) =>
      giveaway.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.created_by.includes(searchTerm),
  )

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
              <p className="text-sm text-emerald-300/40">Server giveaways will appear here when created.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-400/20 hover:bg-white/5">
                <TableHead className="text-emerald-200">Prize</TableHead>
                <TableHead className="text-emerald-200">Description</TableHead>
                <TableHead className="text-emerald-200">Creator</TableHead>
                <TableHead className="text-emerald-200">Duration</TableHead>
                <TableHead className="text-emerald-200">Winners</TableHead>
                <TableHead className="text-emerald-200">End Time</TableHead>
                <TableHead className="text-emerald-200">Status</TableHead>
                <TableHead className="text-emerald-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiveaways.map((giveaway) => (
                <TableRow key={giveaway.id} className="border-emerald-400/20 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-400/60" />
                      <p className="font-medium text-white">{giveaway.prize}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-emerald-200/80 max-w-xs truncate">{giveaway.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400/60" />
                      <p className="font-medium text-white font-mono text-sm">{giveaway.created_by}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400/60" />
                      <p className="text-sm text-emerald-200/80">
                        {giveaway.duration_minutes ? `${giveaway.duration_minutes}m` : "N/A"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      <Trophy className="w-3 h-3 mr-1" />
                      {giveaway.winners_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-emerald-200/80">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-sm">{new Date(giveaway.end_time).toLocaleDateString()}</p>
                        <p className="text-xs text-emerald-200/60">
                          {new Date(giveaway.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        isGiveawayActive(giveaway)
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {isGiveawayActive(giveaway) ? "Active" : "Ended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1">
                      {isGiveawayActive(giveaway) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEndGiveaway(giveaway.id)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGiveaway(giveaway.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
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
