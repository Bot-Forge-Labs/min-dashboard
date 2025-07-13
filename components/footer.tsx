import { Heart, Github, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-emerald-400/20 bg-white/5 backdrop-blur-xl mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-emerald-200/80">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>by Sogs & gg.</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-emerald-300/60">© 2025 Minbot Dashboard. All rights reserved.</div>

            <div className="flex items-center gap-2">
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-emerald-300/80 hover:text-white hover:bg-emerald-500/10 h-8 px-3"
                asChild
              >
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </a>
              </Button> */}

              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-300/80 hover:text-white hover:bg-emerald-500/10 h-8 px-3"
                asChild
              >
                <a href="https://discord.gg/vuK8RptWMs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
