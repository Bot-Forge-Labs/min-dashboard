"use client"

import { Bell, Search, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export function DashboardHeader() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  return (
    <header className="border-b border-emerald-400/20 bg-white/5 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="text-emerald-300 hover:text-white hover:bg-emerald-500/10" />

        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white/5 border-emerald-400/20 text-white placeholder:text-emerald-300/60 focus:border-emerald-400/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-300 hover:text-white hover:bg-emerald-500/10 relative"
          >
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 ring-2 ring-emerald-400/20">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                    alt={user?.user_metadata?.full_name}
                  />
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/10 backdrop-blur-xl border-emerald-400/20"
              align="end"
              forceMount
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">{user?.user_metadata?.full_name || "User"}</p>
                  <p className="w-[200px] truncate text-sm text-emerald-200/70">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-emerald-400/20" />
              <DropdownMenuItem className="text-emerald-200 hover:bg-emerald-500/10">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-red-500/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
