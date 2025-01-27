import { readFileSync } from 'fs';
import { z } from 'zod';
import OpenAI from 'openai';
import { db } from '@/drizzle/db-config';
import { complianceForms, monitoredEnvelopes } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getNextPublishDates } from './utils/getNextPublishDates';
import dayjs from 'dayjs';
import { fetchFormFields, parsePDF } from './utils/pdfToForm';




export async function createFormAndStoreInDb(envelopeId: string, dueDate: dayjs.Dayjs) {

    // TODO: fetch PDF
    const file = readFileSync('./app/crons/sample_contract.pdf');

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
        // TODO: get the next due date

        console.log(envelope);

        const startDate = dayjs(envelope.createdAt).format("YYYY-MM-DD");
        const monitoringFrequencyDays = envelope.monitoringFrequencyDays;

        const dueDates = getNextPublishDates(startDate, monitoringFrequencyDays, 1);

        

        await createFormAndStoreInDb(envelope.envelopeId, dueDates[0]);

        break;
    }
}

processAllEnvelopes()