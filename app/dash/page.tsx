import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LANDING_ROUTE, ONBOARD_ROUTE } from "@/routes.config";
import { getUserInServer } from "../utils/setAuthTokenAsCookie";
import { BorderBeam } from "@/components/ui/border-beam";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db-config";
import { HyperText } from "@/components/ui/hypertext";
import { accounts, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRight, Plus, FileCheck, DollarSign, Trophy, Users } from "lucide-react";

async function DashboardPage() {
  // TODO: authenticated only!!

  const user = await getUserInServer();
  if (!user) {
    return redirect(LANDING_ROUTE)
  }

  const alreadyConnectedAccounts = await db.select().from(accounts)
    .innerJoin(usersToAccountsBridgeTable, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
    .where(eq(usersToAccountsBridgeTable.userId, user.docusignId))

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">NGO Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Manage your organizations and track impact transparently</p>
        </div>
        <Link href={ONBOARD_ROUTE} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add NGO Account
          </Button>
        </Link>
      </div>

      {/* Connected NGOs Section */}
      <section>
        <div className="space-y-3 md:space-y-4 max-w-3xl mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Your NGOs
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage funding, compliance, and impact tracking for your organizations
          </p>
        </div>

        {alreadyConnectedAccounts.length === 0 ? (
          <Card className="p-6 md:p-8 text-center bg-muted/50">
            <div className="space-y-3">
              <h3 className="text-lg md:text-xl font-medium">No NGOs connected yet</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Connect your first NGO through DocuSign to start managing funds and tracking impact
              </p>
              <Link href={ONBOARD_ROUTE} className="block">
                <Button className="mt-4 w-full sm:w-auto">
                  Connect NGO Account
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {alreadyConnectedAccounts.map(({enterprise_info: account}) => (
              <Link href={`/dash/${account.docuSignAccountId}`} key={account.docuSignAccountId} className="block">
                <Card className="h-full group cursor-pointer border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-4 hover:border-green-700/60 hover:bg-card/80 transition-all duration-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg md:text-xl font-semibold  text-ellipsis truncate">
                        {account.docuSignAccountName}
                      </CardTitle>
                      <ArrowRight className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
                    </div>
                    <CardDescription className="text-xs text-ellipsis truncate">
                      Donation Portal: <span className="text-blue-600">{account.donationLink}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 md:pt-4">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileCheck className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Compliance Forms</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Fund Tracking</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats Section */}
      {alreadyConnectedAccounts.length > 0 && (
        <section className="mt-8 md:mt-12">
          <Card className="relative bg-primary/5 overflow-hidden">
          <BorderBeam size={250} duration={10} delay={9} />
            <CardHeader className="pb-2 md:pb-4">
              <HyperText className="text-xl md:text-xl">💡 Platform Highlights</HyperText>
              <CardDescription className="text-sm md:text-base">Quick overview of SignForGood&apos;s impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">$0</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Funds Tracked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">0</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Compliance Forms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">0</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Impact Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

export default DashboardPage;