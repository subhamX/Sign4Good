'use server'

import Link from "next/link"
import { Button } from "./ui/button"
import { AUTH_COOKIE_NAME, getUserInServer } from "@/app/utils/setAuthTokenAsCookie"
import { RainbowButton } from "./ui/rainbow-button"
import { getLoginUrl } from "@/app/getAuthUrl"
import { cookies } from "next/headers"
import { LANDING_ROUTE } from "@/routes.config"
import { redirect } from "next/navigation"
import { LoginButton, LogoutButton } from "./ClientNavbarButtons"

export async function Navbar() {
  const user = await getUserInServer()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-bold tracking-tight">SignForGood</span>
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline-block">| NGO Transparency Platform</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <>
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button size="sm" className="w-full text-xs md:text-sm">
                  Connect Your NGO
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dash">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                  Add NGO
                </Button>
              </Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 