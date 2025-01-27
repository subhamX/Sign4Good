import { readFileSync } from 'fs';
import { db } from '@/drizzle/db-config';
import { complianceForms, monitoredEnvelopes } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getNextPublishDates } from './utils/getNextPublishDates';
import dayjs from 'dayjs';
import { fetchFormFields, parsePDF } from './utils/pdfToForm';
import { downloadDocFromDocusign } from './utils/downloadDocFromDocusign';




export async function createFormAndStoreInDb(envelopeId: string, dueDate: dayjs.Dayjs, filePath: string) {
    const file = readFileSync(filePath);

    const text = await parsePDF(file);
    console.log(text);
    const fields = await fetchFormFields(text);
    console.log(fields);

    await db.insert(complianceForms).values({
        envelopeId: envelopeId,
        formData: fields,
        createdAt: dayjs().toISOString(),
        dueDate: dueDate.toISOString(),
    })
}


export async function processAllEnvelopes() {
    const envelopes = await db.select().from(monitoredEnvelopes).where(eq(monitoredEnvelopes.isProcessed, false));

    for (const envelope of envelopes) {
        const filePath = await downloadDocFromDocusign(envelope.envelopeId);
        const startDate = dayjs(envelope.createdAt).format("YYYY-MM-DD");
        const monitoringFrequencyDays = envelope.monitoringFrequencyDays;
        const dueDates = getNextPublishDates(startDate, monitoringFrequencyDays, 1);

        await createFormAndStoreInDb(envelope.envelopeId, dueDates[0], filePath);
        break;
    }
}

processAllEnvelopes()