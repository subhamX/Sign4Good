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
import { accounts, usersToAccountsBridgeTable } from "@/drizzle/schema"
import { NGOSelector } from "./NGOSelector"
import { Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export async function Navbar() {
  const user = await getUserInServer()

  const connectedNGOs = user ? await db.select({
    id: accounts.docuSignAccountId,
    name: accounts.docuSignAccountName
  }).from(accounts)
    .innerJoin(usersToAccountsBridgeTable, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
    .where(eq(usersToAccountsBridgeTable.userId, user?.docusignId)) : []

  const currentNGO = connectedNGOs.length > 0 ? connectedNGOs[0] : null

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">SignForGood</span>
            <span className="text-xs text-muted-foreground">NGO Transparency</span>
          </Link>
        </div>

        {/* NGO Selector is always visible if available */}
        <div className="flex items-center gap-2">
          {user && connectedNGOs.length > 0 && (
            <NGOSelector ngos={connectedNGOs} currentNGO={currentNGO} />
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="flex items-center">
                        🏆 Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/onboarding" className="flex items-center">
                        + Add NGO
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {!user ? (
                  <DropdownMenuItem>
                    <LoginButton />
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-sm">
                    🏆 Leaderboard
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="ghost" size="sm" className="text-sm whitespace-nowrap">
                    + Add NGO
                  </Button>
                </Link>
              </>
            )}
            {!user ? <LoginButton /> : <LogoutButton />}
          </div>
        </div>
      </div>
    </nav>
  )
} 