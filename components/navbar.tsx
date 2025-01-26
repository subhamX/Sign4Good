'use server'

import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie"
import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db-config"
import { accounts, usersToAccountsBridgeTable } from "@/drizzle/schema"
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