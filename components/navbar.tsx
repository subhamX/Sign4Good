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
import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db-config"
import { accounts } from "@/drizzle/schema"
import { NGOSelector } from "./NGOSelector"

export async function Navbar() {
  const user = await getUserInServer()

  const connectedNGOs = user ? await db.select({
    id: accounts.docuSignAccountId,
    name: accounts.docuSignAccountName
  }).from(accounts).where(eq(accounts.userId, user?.docusignId)) : []

  const currentNGO = connectedNGOs.length > 0 ? connectedNGOs[0] : null

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex flex-col">
            <span className="text-lg md:text-xl font-bold tracking-tight">SignForGood</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">NGO Transparency Platform</span>
          </Link>

          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 ml-6">
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-sm">
                    🏆 Leaderboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <LoginButton/>
          ) : (
            <>
              <Link href="/onboarding" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-sm whitespace-nowrap">
                  + Add NGO
                </Button>
              </Link>

              {connectedNGOs.length > 0 && (
                <NGOSelector ngos={connectedNGOs} currentNGO={currentNGO} />
              )}

              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 