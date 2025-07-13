import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Smooth Animated Background */}
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
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-400 to-green-400 p-4 rounded-2xl shadow-2xl">
                  <img src="https://nqbdotjtceuyftutjvsl.supabase.co/storage/v1/object/public/assets//minbot-icon-transparent.png" className="w-10 h-10" alt="" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                Minbot Dashboard
              </h1>
              <p className="text-emerald-200/80">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
