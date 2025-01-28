import { readFileSync } from 'fs';
import { db } from '@/drizzle/db-config';
import { complianceForms, monitoredEnvelopes } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { getNextPublishDates } from './utils/getNextPublishDates';
import dayjs from 'dayjs';
import { fetchFormFields, parsePDF } from './utils/pdfToForm';
import { downloadDocFromDocusign } from './utils/downloadDocFromDocusign';




export async function createFormAndStoreInDb(envelopeId: string, dueDate: dayjs.Dayjs, filePath: string) {
    const file = readFileSync(filePath);

    const text = await parsePDF(file);
    console.log(text);
    const fetchFormFieldsOut = await fetchFormFields(text);
    console.log(fetchFormFieldsOut);

    // update the xxx
    await db.update(monitoredEnvelopes).set({
        briefDescription: fetchFormFieldsOut.summary,
        moneyReceivedTillDate: parseInt(fetchFormFieldsOut.total_funding_till_date_in_cents),
        isProcessed: true,
    }).where(eq(monitoredEnvelopes.envelopeId, envelopeId));

    await db.insert(complianceForms).values({
        envelopeId: envelopeId,
        generatedSchema: fetchFormFieldsOut.fields,
        createdAt: dayjs().toISOString(),
        dueDate: dueDate.toISOString(),
    })
}


export async function processAllEnvelopesAndCreateComplianceForms() {
    const envelopes = await db.select().from(monitoredEnvelopes).where(eq(monitoredEnvelopes.isProcessed, false));

    for (const envelope of envelopes) {
        if(envelope.donorOfficerEmail !=='credddx@gmail.com'){
            continue;
        }

        const filePath = await downloadDocFromDocusign(envelope.envelopeId);
        const startDate = dayjs(envelope.createdAt).format("YYYY-MM-DD");
        const monitoringFrequencyDays = envelope.monitoringFrequencyDays;
        const dueDates = getNextPublishDates(startDate, monitoringFrequencyDays, 1);

        // check if the envelope is already processed
        const isProcessed = await db.select().from(complianceForms).where(
            and(
                eq(complianceForms.envelopeId, envelope.envelopeId),
                eq(complianceForms.dueDate, dueDates[0].toISOString())
            ));
        if (isProcessed.length > 0) {
            console.log(`Envelope ${envelope.envelopeId} is already processed`);
            continue;
        }

        await createFormAndStoreInDb(envelope.envelopeId, dueDates[0], filePath);
    }
}
