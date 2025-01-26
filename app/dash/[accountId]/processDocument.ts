import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes, users, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import docusign from 'docusign-esign';

export const processDocument = async (envelopeId: string) => {
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

  // 3. Configure DocuSign client
  const dsApiClient = new docusign.ApiClient();
  // For production or other environments, adjust base path accordingly
  dsApiClient.setBasePath("https://account-d.docusign.com/restapi");
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + userInDb.users.accessToken);

  const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  // 4. Retrieve the combined documents as a single PDF
  // 'combined' is a valid documentId for the combined doc
  const fileBytes = await envelopesApi.getDocument(
    envelope[0].accountId,
    envelopeId,
    "combined",
    {}
  );

  // 5. Prepare a local directory for the file
  const documentsDir = "./app/dash/[accountId]/documents";
  if (!existsSync(documentsDir)) {
    mkdirSync(documentsDir, { recursive: true });
  }

  // 6. Write the file to disk
  const tempFilePath = `${documentsDir}/${envelopeId}.pdf`;
  // According to the DocuSign Node SDK docs, `getDocument` returns file data (typically a Buffer).
  writeFileSync(tempFilePath, fileBytes, { encoding: "binary" });

  console.log(`PDF saved to ${tempFilePath}`);

  // Additional logic could happen here, e.g. updating DB references, etc.
};


await processDocument("21d6b2ee-507d-4a15-b8b2-efe0ee41bae5");
