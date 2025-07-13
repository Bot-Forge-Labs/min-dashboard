"use client"

import { Bot, Server, Zap, Shield, Gift, MessageSquare, Users, Settings, BarChart3, Home, Smile } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Servers",
    url: "/dashboard/servers",
    icon: Server,
  },
  {
    title: "Commands",
    url: "/dashboard/commands",
    icon: Zap,
  },
  {
    title: "Moderation",
    url: "/dashboard/moderation",
    icon: Shield,
  },
  {
    title: "Giveaways",
    url: "/dashboard/giveaways",
    icon: Gift,
  },
  {
    title: "Announcements",
    url: "/dashboard/announcements",
    icon: MessageSquare,
  },
  {
    title: "Reaction Roles",
    url: "/dashboard/reaction-roles",
    icon: Smile,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-emerald-400/20 bg-white/5 backdrop-blur-xl">
      <SidebarHeader className="border-b border-emerald-400/20 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-lg blur-sm"></div>
            <div className="relative bg-gradient-to-br from-emerald-400 to-green-400 p-2 rounded-lg shadow-lg">
              <img src="https://nqbdotjtceuyftutjvsl.supabase.co/storage/v1/object/public/assets//minbot-icon-transparent.png" alt="" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              Minbot Dashboard
            </h2>
            <p className="text-xs text-emerald-300/60">v2.0.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-300/80">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-emerald-200/80 hover:text-white hover:bg-emerald-500/10 data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-300"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
