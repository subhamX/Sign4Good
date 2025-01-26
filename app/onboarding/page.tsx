import { LANDING_ROUTE, ONBOARD_ROUTE } from "@/routes.config"
import { getUserAndAccountInfo } from "../utils/getUserAndAccountInfo"
import { getUserInServer } from "../utils/setAuthTokenAsCookie"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db-config"
import { accounts, users, usersToAccountsBridgeTable } from "@/drizzle/schema"
import { eq, inArray, and, isNull, ne, exists, notExists } from "drizzle-orm"
import OnboardingClient from "./OnboardingClient"
import { AddNewAccountFormData, addNewAccountFormSchema, addNewAccountFormSchemaAlreadyConnected } from "./typesX"
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
        console.log(userInfo)
        throw new Error("Error getting user info.. Logic error. this should never happen")
    }


    const accountsAlreadyOnPlatformButNotConnectedWithThisUser = await db.select().from(usersToAccountsBridgeTable)
        .innerJoin(accounts, eq(usersToAccountsBridgeTable.accountId, accounts.docuSignAccountId))
        .where(
            and(
                inArray(usersToAccountsBridgeTable.accountId, userInfo.accounts.map(acc => acc.account_id)),
                notExists(
                    db.select().from(usersToAccountsBridgeTable)
                        .where(
                            and(
                                eq(usersToAccountsBridgeTable.userId, user.docusignId),
                                eq(usersToAccountsBridgeTable.accountId, accounts.docuSignAccountId)
                            )
                        )
                )
            )
        )

    // get the accounts that are already on the platform, but not connected with this user
    const accountsConnectedWithThisUser = await db.select().from(accounts)
        .innerJoin(usersToAccountsBridgeTable,
            and(
                eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId),
            )
        )
        .where(
            eq(usersToAccountsBridgeTable.userId, user.docusignId)
        )

    // console.log(accountsConnectedWithThisUser)

    // const connectedAccountIds = new Set(alreadyConnectedAccounts.map(acc => acc.enterprise_info.docuSignAccountId))

    // get the accounts that are already on the platform, but not connected with this user
    // const accountsAlreadyOnPlatformButNotConnectedWithThisUser = accountsAlreadyOnPlatformButNotConnectedWithThisUserXX.filter(acc => !acc.users_to_accounts_bridge).map(acc => ({
    //     ...acc.enterprise_info,
    // }))

    const connectedAccountIds = new Set(accountsConnectedWithThisUser.map(acc => acc.enterprise_info.docuSignAccountId))
    const accountsAlreadyOnPlatformButNotConnectedWithThisUserIds = new Set(accountsAlreadyOnPlatformButNotConnectedWithThisUser.map(acc => acc.enterprise_info.docuSignAccountId))


    const handleAddNewAccount = async (data: AddNewAccountFormData) => {
        'use server'
        try {

            const user = await getUserInServer()
            if (!user) {
                return {
                    error: "Auth token not found"
                }
            }

            let accountId = ""

            if ('alreadyConnected' in data) {
                const formData = addNewAccountFormSchemaAlreadyConnected.parse(data)
                accountId = formData.accountId
            } else {
                const formData = addNewAccountFormSchema.parse(data)
                accountId = formData.accountId

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
                })
            }

            await db.insert(usersToAccountsBridgeTable).values({
                userId: user.docusignId,
                accountId: accountId,
            })

            revalidatePath(ONBOARD_ROUTE)

            return {
                message: "Account added successfully"
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
            return {
                error: errorMessage
            }
        }
    }


    const notConnectedAccountsAndNotOnPlatform = userInfo.accounts.filter(account => !connectedAccountIds.has(account.account_id) && !accountsAlreadyOnPlatformButNotConnectedWithThisUserIds.has(account.account_id))

    return (
        <OnboardingClient
            notConnectedAccountsAndNotOnPlatform={notConnectedAccountsAndNotOnPlatform}
            accountsAlreadyOnPlatformButNotConnectedWithThisUser={accountsAlreadyOnPlatformButNotConnectedWithThisUser.map(acc => ({
                ...acc.enterprise_info
            }))}
            handleAddNewAccount={handleAddNewAccount}
        />
    )
}