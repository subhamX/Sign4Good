import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LANDING_ROUTE } from "@/routes.config";
import { getEnvelopes } from "../envelopes.server";
import ImportEnvelopesClient from "./ImportEnvelopesClient";

export default async function AccountDashboard({ 
  params 
}: { 
  params: Promise<{ accountId: string } >
}) {
  const user = await getUserInServer();
  if (!user) {
    redirect(LANDING_ROUTE);
  }

  const {accountId} = await params;

  // Get account info
  const accountInfo = await db
    .select()
    .from(accounts)
    .innerJoin(usersToAccountsBridgeTable, eq(
      accounts.docuSignAccountId,
      usersToAccountsBridgeTable.accountId
    ))
    .where(
      and(
        eq(usersToAccountsBridgeTable.userId, user.docusignId)
      )
    );

  if (accountInfo.length === 0) {
    redirect(LANDING_ROUTE);
  }

  // Fetch envelopes from API route
  const data = await getEnvelopes(accountId);

  if ('error' in data) {
    return <div>Error loading envelopes: {data.error}</div>;
  }

  // Get existing monitored envelopes
  const existingMonitored = await db
    .select()
    .from(monitoredEnvelopes)
    .where(eq(monitoredEnvelopes.accountId, accountId));

  const monitoredIds = new Set(existingMonitored.map(e => e.envelopeId));

  const notImportedEnvelopes = data.envelopes?.filter(envelope => !monitoredIds.has(envelope.envelopeId)) || [];

  return (
    <div className="p-4">
      <ImportEnvelopesClient 
        accountId={accountId}
        envelopes={notImportedEnvelopes} 
      />
    </div>
  );
}

