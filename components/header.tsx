import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { HondaLogo } from "@/components/honda-logo"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <HondaLogo />
          <span className="ml-2 font-semibold">Honda Customer Service AI</span>
        </Link>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <nav className="flex items-center space-x-1">
          <Link href="/assistant" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-foreground")}>
            Chat
          </Link>
          <Link
            href="/voice-assistant"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-foreground")}
          >
            Voice
          </Link>
          <Link href="/analytics" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-foreground")}>
            Analytics
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
