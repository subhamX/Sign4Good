import { db } from "@/drizzle/db-config";
import { accounts, complianceForms, monitoredEnvelopes, users, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { eq, isNotNull, isNull, and } from "drizzle-orm";
import { getHtmlFromFilledForm } from "./utils/getHtmlFromFilledForm";
import { renderFormToPDF } from "./utils/renderFormToPDF";
import { sendEnvelope } from "./utils/sendEmailToDonor";
import dayjs from "dayjs";



const sendEmailToDonors = async (
    complianceForm: {
        compliance_forms: (typeof complianceForms.$inferSelect),
        enterprise_info: (typeof accounts.$inferSelect),
        users: (typeof users.$inferSelect),
        users_to_accounts_bridge: (typeof usersToAccountsBridgeTable.$inferSelect),
    }
) => {
    // get the HTML content of the form
    console.log("Generating HTML content for compliance form...")
    const html = await getHtmlFromFilledForm(complianceForm.compliance_forms);
    console.log("HTML content generated successfully")

    // generate the pdf
    console.log("Generating PDF...")
    const pdfPath = await renderFormToPDF(html);
    console.log("PDF generated successfully")
    console.log(pdfPath)

    // send the email.. using docusign

    console.log(`Sending email to donor ${complianceForm.users.email}...`)
    const accountId = complianceForm.enterprise_info.docuSignAccountId;
    const accessToken = complianceForm.users.accessToken;
    const signerEmail = complianceForm.users.email;

    const { envelopeId } = await sendEnvelope(accountId, signerEmail, pdfPath, accessToken);

    // TODO
    console.log(`Email sent to donor ${complianceForm.users.email} successfully!.. Updating DB...`)
    await db.update(complianceForms).set({
        emailSentToDonorAt: dayjs().toISOString(),
        emailSentToDonorEnvelopeId: envelopeId,
    }).where(eq(complianceForms.id, complianceForm.compliance_forms.id));

    console.log(`DB updated successfully!`)


}


const alreadyHandled: string[] = []

const sendEmailsToDonors = async () => {

    const complianceFormsXX = await db.select()
        .from(complianceForms)
        .innerJoin(monitoredEnvelopes, eq(monitoredEnvelopes.envelopeId, complianceForms.envelopeId))
        .innerJoin(accounts, eq(accounts.docuSignAccountId, monitoredEnvelopes.accountId))
        .innerJoin(usersToAccountsBridgeTable, eq(usersToAccountsBridgeTable.accountId, accounts.docuSignAccountId))
        .innerJoin(users, eq(users.docusignId, usersToAccountsBridgeTable.userId))
        .where(
            and(
                isNull(complianceForms.emailSentToDonorAt),
                isNotNull(complianceForms.filledByComplianceOfficerAt)
            )
        );

    console.log(`Number of compliance forms to send emails to: ${complianceFormsXX.length}`)

    for (const complianceForm of complianceFormsXX) {
        if (alreadyHandled.includes(complianceForm.compliance_forms.envelopeId)) {
            continue;
        }
        await sendEmailToDonors(complianceForm);
        // break after one for now.
        alreadyHandled.push(complianceForm.compliance_forms.envelopeId);
    }
}

sendEmailsToDonors()