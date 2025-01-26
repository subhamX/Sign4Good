import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes, users } from "@/drizzle/schema";



export const processDocument = async (envelopeId: string) => {
    const envelope = await db.select().from(monitoredEnvelopes).where(eq(monitoredEnvelopes.envelopeId, envelopeId));

    if (!envelope.length) {
        throw new Error("Envelope not found");
    }

    const envelopeInfo = envelope[0].additionalInfo;

    const attachmentUri = envelopeInfo.attachmentsUri;

    // get the attachment
    //   # Construct your API headers
    // declare -a Headers=('--header' "Authorization: Bearer ${ACCESS_TOKEN}" \
    // 					'--header' "Accept: application/json" \
    // 					'--header' "Content-Type: application/json")

    const uri = `https://account-d.docusign.com/api/v2/accounts/${envelope[0].accountId}/envelopes/${envelopeId}/attachments`


    const userInDb = await db.select().from(users)
        .innerJoin(accounts, eq(accounts.userId, users.docusignId))
        .where(eq(accounts.docuSignAccountId, envelope[0].accountId))
        .then(res => res[0]);

    const headers = {
        Authorization: `Bearer ${userInDb.users.accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }


    const response = await fetch(uri, {
        headers: headers
    });

    const data = await response.json();

    console.log(data);

    // const complianceForms = await db.select().from(complianceForms).where(eq(complianceForms.envelopeId, envelopeId));
}

processDocument("caadf98f-23dd-4e30-beef-7d12d5cc2b35");