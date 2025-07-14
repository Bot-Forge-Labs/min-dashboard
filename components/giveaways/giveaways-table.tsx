"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Users,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Giveaway, Guild } from "@/types/database";
import { toast } from "sonner";

export function GiveawaysTable() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGiveaway, setNewGiveaway] = useState({
    prize: "",
    description: "",
    winners_count: 1,
    duration_minutes: 60,
    guild_id: "",
    channel_id: "",
  });

  const fetchData = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const [giveawaysResult, guildsResult] = await Promise.all([
        supabase
          .from("giveaways")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("guilds")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (giveawaysResult.error) {
        console.error("Error fetching giveaways:", giveawaysResult.error);
        toast.error("Failed to fetch giveaways");
        return;
      }

      if (guildsResult.error) {
        console.error("Error fetching guilds:", guildsResult.error);
        toast.error("Failed to fetch guilds");
        return;
      }

      setGiveaways(giveawaysResult.data || []);
      setGuilds(guildsResult.data || []);

      if (giveawaysResult.data && giveawaysResult.data.length > 0) {
        toast.success(`Loaded ${giveawaysResult.data.length} giveaways`);
      }
    } catch (error) {
      console.error("Error fetching giveaways:", error);
      toast.error("Failed to connect to database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateGiveaway = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + newGiveaway.duration_minutes);

      const { error } = await supabase.from("giveaways").insert({
        prize: newGiveaway.prize,
        description: newGiveaway.description,
        winners_count: newGiveaway.winners_count,
        duration_minutes: newGiveaway.duration_minutes,
        end_time: endTime.toISOString(),
        guild_id: newGiveaway.guild_id,
        channel_id: newGiveaway.channel_id,
        created_by: "dashboard_user", // You might want to get this from auth
        ended: false,
      });

      if (error) {
        console.error("Error creating giveaway:", error);
        toast.error(`Failed to create giveaway: ${error.message}`);
        return;
      }

      toast.success("Giveaway created successfully");
      setIsCreateDialogOpen(false);
      setNewGiveaway({
        prize: "",
        description: "",
        winners_count: 1,
        duration_minutes: 60,
        guild_id: "",
        channel_id: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating giveaway:", error);
      toast.error("Failed to create giveaway");
    }
  };

  const handleDeleteGiveaway = async (giveawayId: number) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { error } = await supabase
        .from("giveaways")
        .delete()
        .eq("id", giveawayId);

      if (error) {
        console.error("Error deleting giveaway:", error);
        toast.error("Failed to delete giveaway");
        return;
      }

      toast.success("Giveaway deleted successfully");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error deleting giveaway:", error);
      toast.error("Failed to delete giveaway");
    }
  };

  const handleEndGiveaway = async (giveawayId: number) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { error } = await supabase
        .from("giveaways")
        .update({ ended: true })
        .eq("id", giveawayId);

      if (error) {
        console.error("Error ending giveaway:", error);
        toast.error("Failed to end giveaway");
        return;
      }

      toast.success("Giveaway ended successfully");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error ending giveaway:", error);
      toast.error("Failed to end giveaway");
    }
  };

  const filteredGiveaways = giveaways.filter(
    (giveaway) =>
      giveaway.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (giveaway.description ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (ended: boolean, endTime: string) => {
    if (ended) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (new Date(endTime) < new Date())
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-green-500/10 text-green-400 border-green-500/20";
  };

  const getStatus = (ended: boolean, endTime: string) => {
    if (ended) return "Ended";
    if (new Date(endTime) < new Date()) return "Expired";
    return "Active";
  };

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
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Giveaways</CardTitle>
            <CardDescription className="text-emerald-200/80">
              Manage server giveaways and track winners
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Giveaway
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Giveaway
                  </DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    Create a new giveaway for your server members.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guildSelect" className="text-emerald-200">
                      Guild
                    </Label>
                    <select
                      id="guildSelect"
                      value={newGiveaway.guild_id}
                      onChange={(e) =>
                        setNewGiveaway({
                          ...newGiveaway,
                          guild_id: e.target.value,
                        })
                      }
                      className="w-full mt-1 p-2 bg-white/5 border border-emerald-400/20 rounded-md text-white"
                    >
                      <option value="">Select a guild</option>
                      {guilds.map((guild) => (
                        <option
                          key={guild.guild_id}
                          value={guild.guild_id}
                          className="bg-gray-800"
                        >
                          {guild.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="prize" className="text-emerald-200">
                      Prize
                    </Label>
                    <Input
                      id="prize"
                      value={newGiveaway.prize}
                      onChange={(e) =>
                        setNewGiveaway({
                          ...newGiveaway,
                          prize: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter prize name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-emerald-200">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newGiveaway.description}
                      onChange={(e) =>
                        setNewGiveaway({
                          ...newGiveaway,
                          description: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter giveaway description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="winnersCount"
                        className="text-emerald-200"
                      >
                        Winners Count
                      </Label>
                      <Input
                        id="winnersCount"
                        type="number"
                        min="1"
                        value={newGiveaway.winners_count}
                        onChange={(e) =>
                          setNewGiveaway({
                            ...newGiveaway,
                            winners_count: Number.parseInt(e.target.value) || 1,
                          })
                        }
                        className="bg-white/5 border-emerald-400/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-emerald-200">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={newGiveaway.duration_minutes}
                        onChange={(e) =>
                          setNewGiveaway({
                            ...newGiveaway,
                            duration_minutes:
                              Number.parseInt(e.target.value) || 60,
                          })
                        }
                        className="bg-white/5 border-emerald-400/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="channelId" className="text-emerald-200">
                      Channel ID
                    </Label>
                    <Input
                      id="channelId"
                      value={newGiveaway.channel_id}
                      onChange={(e) =>
                        setNewGiveaway({
                          ...newGiveaway,
                          channel_id: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter channel ID"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/10 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGiveaway}
                    disabled={
                      !newGiveaway.prize ||
                      !newGiveaway.guild_id ||
                      !newGiveaway.channel_id
                    }
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    Create Giveaway
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
              {searchTerm
                ? "No giveaways found matching your search."
                : "No giveaways found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Giveaways will appear here when they are created.
              </p>
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
                <TableHead className="text-emerald-200 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiveaways.map((giveaway) => (
                <TableRow
                  key={giveaway.id}
                  className="border-emerald-400/20 hover:bg-white/5"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">
                        {giveaway.prize}
                      </div>
                      <div className="text-sm text-emerald-300/60 max-w-xs truncate">
                        {giveaway.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-200">
                        {giveaway.winners_count}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {giveaway.created_by}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    {giveaway.duration_minutes
                      ? `${giveaway.duration_minutes} min`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    {formatDistanceToNow(new Date(giveaway.end_time), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(
                        giveaway.ended ?? false,
                        giveaway.end_time
                      )}
                    >
                      {getStatus(giveaway.ended ?? false, giveaway.end_time)}
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
                      <DropdownMenuContent
                        align="end"
                        className="bg-white/10 backdrop-blur-xl border-emerald-400/20"
                      >
                        <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!giveaway.ended &&
                          new Date(giveaway.end_time) > new Date() && (
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
  );
}
