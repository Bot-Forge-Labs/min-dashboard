import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Footer } from "@/components/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/50 to-green-900/50 animate-gradient-slow"
        style={{ backgroundSize: "400% 400%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/3 via-green-400/3 to-teal-400/3"></div>
      </div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(34,197,94,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <SidebarProvider defaultOpen={true}>
        <div className="relative z-10 flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
            <Footer />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
