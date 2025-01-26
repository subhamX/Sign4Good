import { LANDING_ROUTE, ONBOARD_ROUTE } from "@/routes.config"
import { getUserAndAccountInfo } from "../utils/getUserAndAccountInfo"
import { getJwtPayloadFromCookie, getUserInServer } from "../utils/setAuthTokenAsCookie"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db-config"
import { accounts, users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import OnboardingClient from "./OnboardingClient"
import { COUNTRIES } from "./countries"
import { AddNewAccountFormData, addNewAccountFormSchema } from "./typesX"
import { revalidatePath } from "next/cache"





export default async function OnboardingPage() {
    const user = await getUserInServer()
    if (!user) {
        return redirect(LANDING_ROUTE)
    }

    const userFromDb = await db.select().from(users).where(eq(users.docusignId, user.docusignId))
    if (userFromDb.length !== 1) {
        throw new Error("User not found.. Logic error. this should never happen")
    }

    const userInfo = await getUserAndAccountInfo(userFromDb[0].accessToken)

    if ('error' in userInfo) {
        throw new Error("Error getting user info.. Logic error. this should never happen")
    }

    console.log(userInfo.sub)
    const alreadyConnectedAccounts = await db.select().from(accounts).where(eq(accounts.userId, userInfo.sub))
    const connectedAccountIds = new Set(alreadyConnectedAccounts.map(acc => acc.docuSignAccountId))



    const handleAddNewAccount = async (data: AddNewAccountFormData) => {
        'use server'
        try {
            const formData = addNewAccountFormSchema.parse(data)


            const user = await getUserInServer()
            if (!user) {
                return {
                    error: "Auth token not found"
                }
            }

            // get accessToken
            const userFromDb = await db.select().from(users).where(eq(users.docusignId, user.docusignId))
            if (userFromDb.length !== 1) {
                return {
                    error: "Logic error. this should never happen.. x2"
                }
            }
            const accessToken = userFromDb[0].accessToken

            const accountsInfo = await getUserAndAccountInfo(accessToken)
            if ('error' in accountsInfo) {
                return {
                    error: accountsInfo.error
                }
            }

            const accountInfo = accountsInfo.accounts.filter(acc => acc.account_id === formData.accountId)
            if (accountInfo.length !== 1) {
                return {
                    error: "Account not found"
                }
            }

            await db.insert(accounts).values({
                docuSignAccountId: formData.accountId,
                docuSignAccountName: accountInfo[0].account_name,
                docuSignBaseUrl: accountInfo[0].base_uri,
                country: formData.country,
                includeInLeaderBoard: formData.leaderboard,
                donationLink: formData.donationLink,
                createdAt: new Date(),
                userId: user.docusignId,
            })

            revalidatePath(ONBOARD_ROUTE)
            
            return {
                message: "Account added successfully"
            }
        } catch (err: any) {
            console.log(err)
            return {
                error: err.message
            }
        }
    }

    return (
        <OnboardingClient
            notConnectedAccounts={userInfo.accounts.filter(account => !connectedAccountIds.has(account.account_id))}
            handleAddNewAccount={handleAddNewAccount}
        />
    )
}