import fs from 'fs';
import path from 'path';
import docusign from 'docusign-esign';
import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db-config';
import { users, accounts, usersToAccountsBridgeTable } from '@/drizzle/schema';
import { DOCUMENT_TYPE_KEY } from '../../dash/[accountId]/envelopes.config';
import { DOCUMENT_TYPE_VALUE } from '../../dash/[accountId]/envelopes.config';




export async function sendEnvelope(
  accountId: string,
  signerEmail: string,
  pdfPath: string,
  accessToken: string
) {
  try {

    const signerName = signerEmail.split("@")[0];


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
      customFields: {
        textCustomFields: [
          {
            name: DOCUMENT_TYPE_KEY,
            value: DOCUMENT_TYPE_VALUE,
            required: 'true',
            show: 'true',
          },
        ],
      },
      eventNotification: {
        url: "https://signforgood.vercel.app/docusign/event-callback",
        loggingEnabled: "true",
        envelopeEvents: [
          {
            envelopeEventStatusCode: "completed"
          },
          {
            envelopeEventStatusCode: "declined"
          }
        ],
        recipientEvents: [
          {
            recipientEventStatusCode: "Sent"
          },
          {
            recipientEventStatusCode: "Completed"
          }
        ]
      },
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
    };
  } catch (error) {
    console.error('Error sending envelope:', error);
    throw error;
  }
}
