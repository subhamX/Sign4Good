import { db } from "@/drizzle/db-config";
import { complianceForms, monitoredEnvelopes } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import RenderFormClient from "./RenderForm";


export default async function RenderForm({
    params
}: {
    params: Promise<{
        formId: number
    }>
}) {
    const { formId } = await params;
    const form = await db.select().from(complianceForms).where(eq(complianceForms.id, formId));

    if(form.length === 0) {
        return <div>Form not found</div>
    }

    const envelope = await db.select().from(monitoredEnvelopes).where(eq(monitoredEnvelopes.envelopeId, form[0].envelopeId));

    if(envelope.length === 0) {
        return <div>Envelope not found</div>
    }

    return (
        <div>
            <RenderFormClient envelope={envelope[0]} form={form[0]} />
        </div>
    )
}

