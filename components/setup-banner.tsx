"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, CheckCircle, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SetupBanner() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "blocked" | "error">("checking")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setConnectionStatus("error")
          setIsLoading(false)
          return
        }

        // Test connection to Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "HEAD",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        })

        if (response.ok) {
          setConnectionStatus("connected")
        } else if (response.status === 0 || !response.ok) {
          setConnectionStatus("blocked")
        } else {
          setConnectionStatus("error")
        }
      } catch (error) {
        console.error("Supabase connection test failed:", error)
        setConnectionStatus("blocked")
      } finally {
        setIsLoading(false)
      }
    }

    checkSupabaseConnection()
  }, [])

  if (isLoading) {
    return null
  }

  if (connectionStatus === "connected") {
    return (
      <Card className="bg-emerald-500/10 border-emerald-500/20 mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-emerald-200 font-medium">Supabase Connected</h3>
            <p className="text-emerald-200/70 text-sm">
              Your dashboard is connected to Supabase and ready to display real data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectionStatus === "blocked") {
    return (
      <Card className="bg-red-500/10 border-red-500/20 mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-200 font-medium">Supabase Connection Blocked</h3>
            <p className="text-red-200/70 text-sm mb-2">
              Your network or firewall is blocking access to Supabase. This could be due to:
            </p>
            <ul className="text-red-200/70 text-xs space-y-1 ml-4 list-disc">
              <li>Corporate firewall or network restrictions</li>
              <li>Ad blocker or browser security settings</li>
              <li>VPN or proxy configuration</li>
              <li>DNS filtering or parental controls</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-200 hover:bg-red-500/10 bg-transparent"
              onClick={() => window.location.reload()}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-200 hover:bg-red-500/10 bg-transparent"
              asChild
            >
              <a
                href="https://supabase.com/docs/guides/platform/network-restrictions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Help
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-yellow-500/10 border-yellow-500/20 mb-6">
      <CardContent className="flex items-center gap-4 p-4">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-yellow-200 font-medium">Supabase Configuration Required</h3>
          <p className="text-yellow-200/70 text-sm">
            To see real data, please configure your Supabase environment variables in your .env.local file.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-yellow-500/20 text-yellow-200 hover:bg-yellow-500/10 bg-transparent"
          asChild
        >
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
            Open Supabase
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
