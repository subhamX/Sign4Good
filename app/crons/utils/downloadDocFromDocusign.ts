import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes, users, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import os from 'os';

export const downloadDocFromDocusign = async (envelopeId: string) => {
  console.log("Processing document for envelopeId:", envelopeId);

  // 1. Fetch the envelope record from the DB
  const envelope = await db
    .select()
    .from(monitoredEnvelopes)
    .where(eq(monitoredEnvelopes.envelopeId, envelopeId));

  if (!envelope.length) {
    throw new Error("Envelope not found");
  }

  // For demonstration, we extract additionalInfo, though it's not used in this snippet
  const envelopeInfo = envelope[0].additionalInfo;
  const attachmentUri = envelopeInfo.attachmentsUri;

  // 2. Get a user/token from the DB who has read access
  const userInDb = await db
    .select()
    .from(users)
    .innerJoin(
      usersToAccountsBridgeTable,
      eq(usersToAccountsBridgeTable.userId, users.docusignId)
    )
    .innerJoin(accounts, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
    .where(eq(accounts.docuSignAccountId, envelope[0].accountId))
    .then((res) => res[0]);

  console.log("Access token:", userInDb.users.accessToken);


  const response = await fetch(`https://demo.docusign.net/restapi/v2/accounts/${envelope[0].accountId}/envelopes/${envelopeId}/documents/combined`, {
    headers: {
      'Authorization': `Bearer ${userInDb.users.accessToken}`,
    },
  });

  console.log('response', response)

  const fileBytes = await response.arrayBuffer();

  // 5. Prepare a local directory for the file

  const baseDir = os.tmpdir();
  const documentsDir = `${baseDir}/documents`;
  if (!existsSync(documentsDir)) {
    mkdirSync(documentsDir, { recursive: true });
  }

  // 6. Write the file to disk
  const tempFilePath = `${documentsDir}/${envelopeId}.pdf`;
  // According to the DocuSign Node SDK docs, `getDocument` returns file data (typically a Buffer).
  writeFileSync(tempFilePath, Buffer.from(fileBytes));

  console.log(`PDF saved to ${tempFilePath}`);

  return tempFilePath;
};

