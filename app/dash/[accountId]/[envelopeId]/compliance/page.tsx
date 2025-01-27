import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie"
import { db } from "@/drizzle/db-config"
import { accounts, complianceForms, monitoredEnvelopes } from "@/drizzle/schema"
import { LANDING_ROUTE } from "@/routes.config"
import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ComplianceCardClient } from "./ComplianceCard"


export default async function CompliancePage({
  params
}: {
  params: Promise<{
    accountId: string,
    envelopeId: string
  }>
}) {
  const user = await getUserInServer()

  if (!user) {
    return redirect(LANDING_ROUTE)
  }

  const { accountId, envelopeId } = await params

  const allComplianceDocs = await db.select({
    compliance_forms: complianceForms,
    monitored_envelopes: monitoredEnvelopes
  })
    .from(complianceForms)
    .innerJoin(monitoredEnvelopes, eq(monitoredEnvelopes.envelopeId, complianceForms.envelopeId))
    .where(
      and(
        eq(monitoredEnvelopes.envelopeId, envelopeId)
      )
    )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage compliance forms for this envelope
        </p>
      </div>

      <div className="space-y-6">
        {allComplianceDocs.map((doc) => (
          <ComplianceCardClient 
            key={doc.compliance_forms.id} 
            form={doc.compliance_forms} 
            envelopeInfo={doc.monitored_envelopes}
          />
        ))}

        {allComplianceDocs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No compliance documents found for this envelope.</p>
          </div>
        )}
      </div>
    </div>
  )
}