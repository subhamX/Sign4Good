'use server'

import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie";
import { db } from "@/drizzle/db-config";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";



export type EnvelopeDocuSign = {
    status: string;
    documentsCombinedUri: string;
    documentsUri: string;
    recipientsUri: string;
    attachmentsUri: string;
    envelopeUri: string;
    emailSubject: string;
    emailBlurb: string;
    envelopeId: string;
    signingLocation: string;
    customFieldsUri: string;
    notificationUri: string;
    enableWetSign: string;
    allowMarkup: string;
    allowReassign: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    initialSentDateTime: string;
    sentDateTime: string;
    completedDateTime: string;
    statusChangedDateTime: string;
    certificateUri: string;
    templatesUri: string;
    purgeState: string;
    expireEnabled: string;
    expireDateTime: string;
    expireAfter: string;
    sender: {
        userName: string;
        userId: string;
        email: string;
    };
    customFields: {
        textCustomFields: Array<{
            name: string;
            value: string;
            required: string;
            show: string;
        }>;
        listCustomFields: Array<{
            name: string;
            value: string;
            required: string;
            show: string;
        }>;
    };
    is21CFRPart11: boolean;
    isSignatureProviderEnvelope: boolean;
    allowViewHistory: boolean;
    hasFormDataChanged: boolean;
    allowComments: boolean;
    hasComments: boolean;
    envelopeLocation: string;
    isDynamicEnvelope: boolean;
}

export async function getEnvelopes(accountId: string): Promise<{ envelopes?: EnvelopeDocuSign[] } | { error: string }> {
    const user = await getUserInServer();
    if (!user) {
        return {
            error: "not authenticated"
        }
    }

    const userInDb = await db.select().from(users).where(eq(users.docusignId, user.docusignId));


    const urlSearchParams = new URLSearchParams({
        'from_date': '2024-01-01',
    });


    const response = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes?${urlSearchParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInDb[0].accessToken}`,
        },
    });

    try {
        const data = await response.json();

        if('errorCode' in data) {
            return {
                error: data.message
            }
        }

        return data;
    } catch (error: unknown) {
        return {
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
    }

}
