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
import { ClientNavbar } from "./ClientNavbar"

export async function Navbar() {
  const user = await getUserInServer()

  const connectedNGOs = user ? await db.select({
    id: accounts.docuSignAccountId,
    name: accounts.docuSignAccountName
  }).from(accounts)
    .innerJoin(usersToAccountsBridgeTable, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
    .where(eq(usersToAccountsBridgeTable.userId, user?.docusignId)) : []

  return (
    <ClientNavbar
      user={user}
      connectedNGOs={connectedNGOs}
    />
  )
} 