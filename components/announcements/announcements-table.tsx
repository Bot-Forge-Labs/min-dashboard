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
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Announcement, Guild } from "@/types/database";
import { toast } from "sonner";

export function AnnouncementsTable() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    guild_id: "",
    channel_id: "",
    embed_color: 9166521, // Default emerald color
  });

  const fetchData = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const [announcementsResult, guildsResult] = await Promise.all([
        supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("guilds")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (announcementsResult.error) {
        console.error(
          "Error fetching announcements:",
          announcementsResult.error
        );
        toast.error("Failed to fetch announcements");
        return;
      }

      if (guildsResult.error) {
        console.error("Error fetching guilds:", guildsResult.error);
        toast.error("Failed to fetch guilds");
        return;
      }

      setAnnouncements(announcementsResult.data || []);
      setGuilds(guildsResult.data || []);

      if (announcementsResult.data && announcementsResult.data.length > 0) {
        toast.success(
          `Loaded ${announcementsResult.data.length} announcements`
        );
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
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

  const handleCreateAnnouncement = async () => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { error } = await supabase.from("announcements").insert({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        guild_id: newAnnouncement.guild_id,
        channel_id: newAnnouncement.channel_id,
        embed_color: newAnnouncement.embed_color,
        created_by: "dashboard_user", // You might want to get this from auth
      });

      if (error) {
        console.error("Error creating announcement:", error);
        toast.error(`Failed to create announcement: ${error.message}`);
        return;
      }

      toast.success("Announcement created successfully");
      setIsCreateDialogOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        guild_id: "",
        channel_id: "",
        embed_color: 9166521,
      });
      fetchData();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error("Supabase client not available");
        return;
      }

      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
        return;
      }

      toast.success("Announcement deleted successfully");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.created_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    );
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
                <Button className="bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/10 backdrop-blur-xl border-emerald-400/20">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Announcement
                  </DialogTitle>
                  <DialogDescription className="text-emerald-200/80">
                    Create a new announcement for your server.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guildSelect" className="text-emerald-200">
                      Guild
                    </Label>
                    <select
                      id="guildSelect"
                      value={newAnnouncement.guild_id}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
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
                    <Label htmlFor="title" className="text-emerald-200">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          title: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter announcement title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-emerald-200">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          content: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter announcement content"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="channelId" className="text-emerald-200">
                      Channel ID
                    </Label>
                    <Input
                      id="channelId"
                      value={newAnnouncement.channel_id}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          channel_id: e.target.value,
                        })
                      }
                      className="bg-white/5 border-emerald-400/20 text-white"
                      placeholder="Enter channel ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="embedColor" className="text-emerald-200">
                      Embed Color
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="embedColor"
                        type="color"
                        value={`#${newAnnouncement.embed_color
                          .toString(16)
                          .padStart(6, "0")}`}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            embed_color: Number.parseInt(
                              e.target.value.replace("#", ""),
                              16
                            ),
                          })
                        }
                        className="w-16 h-10 bg-white/5 border-emerald-400/20"
                      />
                      <Input
                        value={newAnnouncement.embed_color}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            embed_color:
                              Number.parseInt(e.target.value) || 9166521,
                          })
                        }
                        className="bg-white/5 border-emerald-400/20 text-white"
                        placeholder="Color as number"
                        type="number"
                      />
                    </div>
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
                    onClick={handleCreateAnnouncement}
                    disabled={
                      !newAnnouncement.title ||
                      !newAnnouncement.content ||
                      !newAnnouncement.guild_id ||
                      !newAnnouncement.channel_id
                    }
                    className="bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    Create Announcement
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
              {searchTerm
                ? "No announcements found matching your search."
                : "No announcements found."}
            </p>
            {!searchTerm && (
              <p className="text-sm text-emerald-300/40">
                Announcements will appear here when they are created.
              </p>
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
                <TableHead className="text-emerald-200 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow
                  key={announcement.id}
                  className="border-emerald-400/20 hover:bg-white/5"
                >
                  <TableCell className="font-medium text-white max-w-xs">
                    {announcement.title}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 max-w-md truncate">
                    {announcement.content}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {announcement.channel_id}
                  </TableCell>
                  <TableCell className="text-emerald-200/80 font-mono text-sm">
                    {announcement.created_by}
                  </TableCell>
                  <TableCell className="text-emerald-200/80">
                    {formatDistanceToNow(
                      new Date(announcement?.created_at ?? new Date()),
                      {
                        addSuffix: true,
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded border border-emerald-400/20"
                      style={{
                        backgroundColor: announcement.embed_color
                          ? `#${announcement.embed_color
                              .toString(16)
                              .padStart(6, "0")}`
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
                      <DropdownMenuContent
                        align="end"
                        className="bg-white/10 backdrop-blur-xl border-emerald-400/20"
                      >
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
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
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
