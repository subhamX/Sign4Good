'use server'

import { getUserInServer } from '@/app/utils/setAuthTokenAsCookie';
import { db } from '@/drizzle/db-config';
import { monitoredEnvelopes } from '@/drizzle/schema';
import { DASH_ACCOUNT_IMPORT_ROUTE } from '@/routes.config';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getEnvelopes } from './envelopes.server';

const envelopeSchema = z.object({
  envelopeId: z.string(),
  complianceOfficerEmail: z.string().email(),
  monitoringFrequencyDays: z.number().int().min(1),
});

const requestSchema = z.object({
  envelopes: z.array(envelopeSchema),
  accountId: z.string(),
});

export async function createEnvelopesServerAction(formData: z.infer<typeof requestSchema>) {
  try {
    const user = await getUserInServer();
    if (!user) {
      return {
        error: 'Unauthorized',
      }
    }

    const validatedData = requestSchema.parse(formData);

    const envelopes = await getEnvelopes(validatedData.accountId);

    if ('error' in envelopes) {
      return {
        error: 'Failed to get envelopes',
      }
    }


    // Create monitoring records for each envelope
    await db.transaction(async (tx) => {
      for (const envelope of validatedData.envelopes) {
        const nextReviewDate = new Date();

        const upStreamEnvelope = envelopes.envelopes?.find(e => e.envelopeId === envelope.envelopeId);

        if(!upStreamEnvelope) {
          throw new Error('Envelope not found in upstream');
        }

        nextReviewDate.setDate(nextReviewDate.getDate() + envelope.monitoringFrequencyDays);

        await tx.insert(monitoredEnvelopes).values({
          envelopeId: envelope.envelopeId,
          accountId: validatedData.accountId,
          complianceOfficerEmail: envelope.complianceOfficerEmail,
          monitoringFrequencyDays: envelope.monitoringFrequencyDays,
          nextReviewDate,
          createdBy: user.docusignId,
          additionalInfo: upStreamEnvelope,
        });
      }
    });
    revalidatePath(DASH_ACCOUNT_IMPORT_ROUTE(validatedData.accountId));

    return {
      message: 'Envelopes created successfully',
    }
  } catch (error) {
    console.error('Error monitoring envelopes:', error);
    return {
      error: 'Failed to monitor envelopes',
    }
  }
} 