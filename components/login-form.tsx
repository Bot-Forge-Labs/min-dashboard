"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { FaDiscord } from "react-icons/fa";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { signInWithDiscord } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithDiscord();
      toast.success("Redirecting to Discord...");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-white">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <Button
              variant="discord"
              size="lg"
              className="w-full "
              type="submit"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FaDiscord className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                )}
                <span>
                  {isLoading ? "Connecting..." : "Continue with Discord"}
                </span>
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                )}
              </div>
            </Button>
          </form>

          <div className="text-center text-xs text-emerald-300/60">
            <p>Secure access to your private dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
