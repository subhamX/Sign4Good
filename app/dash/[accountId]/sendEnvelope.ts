import fs from 'fs';
import path from 'path';
import docusign from 'docusign-esign';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db-config';
import { users, accounts, usersToAccountsBridgeTable } from '@/drizzle/schema';

export async function sendEnvelope(
  accountId: string, 
  signerEmail: string, 
  signerName: string
) {
  try {
    // 1) Find a user that has an access token for this specific accountId
    //    (assuming your 'usersToAccountsBridgeTable' links DocuSign accounts to users)
    const userRecord = await db
      .select()
      .from(users)
      .innerJoin(
        usersToAccountsBridgeTable,
        eq(usersToAccountsBridgeTable.userId, users.docusignId)
      )
      .innerJoin(accounts, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
      .where(eq(accounts.docuSignAccountId, accountId));

    if (!userRecord.length) {
      throw new Error(`No user found for accountId=${accountId}`);
    }

    const { accessToken } = userRecord[0].users;
    if (!accessToken) {
      throw new Error(`User does not have a stored access token for accountId=${accountId}`);
    }

    // 2) Configure the DocuSign API Client
    const apiClient = new docusign.ApiClient();
    // Adjust the base path for Demo vs. Production:
    //   - Demo: "https://demo.docusign.net/restapi"
    //   - Production: "https://www.docusign.net/restapi"
    apiClient.setBasePath('https://demo.docusign.net/restapi');
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // 3) Load your PDF and convert to Base64
    //    Suppose it lives at ./app/dash/[accountId]/documents/sample_contract.pdf
    const pdfPath = path.join(process.cwd(), 'app/dash/[accountId]/documents', 'sample_contract.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // 4) Create an Envelope definition
    const envelopeDefinition = {
      emailSubject: 'Please sign the sample contract',
      emailBlurb: 'Hello! Please review and sign this document.',
      documents: [
        {
          documentBase64: pdfBase64,
          name: 'Sample Contract',
          fileExtension: 'pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: signerEmail,
            name: signerName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '400',
                  yPosition: '150',
                },
              ],
            },
          },
        ],
      },
      status: 'sent', // "sent" => email is sent immediately
    };

    // 5) Send the Envelope
    const results = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
    
    console.log(`Envelope created and sent successfully! EnvelopeId: ${results.envelopeId}`);
    
    return {
      envelopeId: results.envelopeId,
      message: 'Envelope sent successfully',
    };
  } catch (error) {
    console.error('Error sending envelope:', error);
    throw error;
  }
}

await sendEnvelope(
    "3c51dad6-1384-4905-925e-decceaf0e375",
    "gaurangruparelia007@gmail.com",
    "Gaurang"
  )