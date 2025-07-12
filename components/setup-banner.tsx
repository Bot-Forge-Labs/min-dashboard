"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SetupBanner() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if environment variables are available on client side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setIsConfigured(!!(supabaseUrl && supabaseKey))
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null
  }

  if (isConfigured) {
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
