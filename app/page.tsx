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
                  {/* Fallback to Bot icon if image fails to load */}
                  <div className="w-16 h-16 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
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
