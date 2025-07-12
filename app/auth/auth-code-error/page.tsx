import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 animate-gradient-slow"
        style={{ backgroundSize: "400% 400%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-green-400/5 to-teal-400/5"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-red-400/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-white">Authentication Error</CardTitle>
            <CardDescription className="text-red-200/80">
              There was an error during the authentication process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-200/70 space-y-2">
              <p>This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Invalid or expired authorization code</li>
                <li>Discord OAuth configuration issues</li>
                <li>Network connectivity problems</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
