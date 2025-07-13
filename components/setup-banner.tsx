"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, CheckCircle, Wifi, WifiOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SetupBanner() {
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "blocked" | "error" | "configured"
  >("checking")
  const [isLoading, setIsLoading] = useState(true)
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log("Checking Supabase connection...")
        console.log("URL exists:", !!supabaseUrl)
        console.log("Key exists:", !!supabaseKey)

        if (!supabaseUrl || !supabaseKey) {
          setConnectionStatus("error")
          setErrorDetails("Environment variables not found")
          setIsLoading(false)
          return
        }

        // Test connection to Supabase REST API
        const testUrl = `${supabaseUrl}/rest/v1/`
        console.log("Testing connection to:", testUrl)

        const response = await fetch(testUrl, {
          method: "HEAD",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        })

        console.log("Response status:", response.status)
        console.log("Response ok:", response.ok)

        if (response.ok) {
          // Try to test actual database connection
          try {
            const testQuery = await fetch(`${supabaseUrl}/rest/v1/guilds?select=count`, {
              method: "HEAD",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: "count=exact",
              },
            })

            if (testQuery.ok) {
              setConnectionStatus("connected")
            } else {
              setConnectionStatus("configured")
              setErrorDetails("Connected but tables may not exist")
            }
          } catch (dbError) {
            setConnectionStatus("configured")
            setErrorDetails("Connected but database schema needs setup")
          }
        } else if (response.status === 0 || response.status >= 500) {
          setConnectionStatus("blocked")
          setErrorDetails(`Network error (${response.status})`)
        } else if (response.status === 401 || response.status === 403) {
          setConnectionStatus("error")
          setErrorDetails("Invalid API key or permissions")
        } else {
          setConnectionStatus("error")
          setErrorDetails(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Supabase connection test failed:", error)
        setConnectionStatus("blocked")
        setErrorDetails(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    checkSupabaseConnection()
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-blue-500/10 border-blue-500/20 mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <Loader2 className="w-5 h-5 text-blue-400 flex-shrink-0 animate-spin" />
          <div className="flex-1">
            <h3 className="text-blue-200 font-medium">Checking Supabase Connection...</h3>
            <p className="text-blue-200/70 text-sm">Testing database connectivity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectionStatus === "connected") {
    return (
      <Card className="bg-emerald-500/10 border-emerald-500/20 mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-emerald-200 font-medium">Supabase Connected & Ready</h3>
            <p className="text-emerald-200/70 text-sm">
              Your dashboard is connected to Supabase and ready to display real data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectionStatus === "configured") {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/20 mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-yellow-200 font-medium">Supabase Connected - Setup Required</h3>
            <p className="text-yellow-200/70 text-sm mb-2">
              Supabase is connected but database tables need to be created.
            </p>
            <p className="text-yellow-200/60 text-xs">
              Run the SQL scripts in the scripts folder to set up your database schema.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/20 text-yellow-200 hover:bg-yellow-500/10 bg-transparent"
              onClick={() => window.location.reload()}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Retry
            </Button>
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
            <p className="text-red-200/70 text-sm mb-2">Your network or firewall is blocking access to Supabase.</p>
            <p className="text-red-200/60 text-xs mb-2">Error: {errorDetails}</p>
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
    <Card className="bg-red-500/10 border-red-500/20 mb-6">
      <CardContent className="flex items-center gap-4 p-4">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-200 font-medium">Supabase Configuration Error</h3>
          <p className="text-red-200/70 text-sm mb-1">There's an issue with your Supabase configuration.</p>
          <p className="text-red-200/60 text-xs">Error: {errorDetails}</p>
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
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              Open Supabase
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
