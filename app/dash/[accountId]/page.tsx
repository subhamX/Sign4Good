import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie";
import { db } from "@/drizzle/db-config";
import { accounts, complianceForms, monitoredEnvelopes } from "@/drizzle/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LANDING_ROUTE } from "@/routes.config";
import { CollapsibleDetails } from "./CollapsibleDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COUNTRIES } from "@/app/onboarding/countries";

export default async function AccountDashboard({
  params
}: {
  params: { accountId: string }
}) {
  const user = await getUserInServer();
  if (!user) {
    redirect(LANDING_ROUTE);
  }

  // Get account info
  const accountInfo = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.docuSignAccountId, params.accountId),
        eq(accounts.userId, user.docusignId)
      )
    );

  if (accountInfo.length === 0) {
    redirect(LANDING_ROUTE);
  }

  const rankedComplianceForms = db.$with("mostRecentComplianceForms").as(
    db
      .select({
        envelopeId: complianceForms.envelopeId,
        emailSentAt: complianceForms.emailSentAt,
        rn: sql`ROW_NUMBER() OVER (PARTITION BY ${complianceForms.envelopeId} ORDER BY ${complianceForms.dueDate} DESC)`.as("rn")
      })
      .from(complianceForms)
  );

  // Fetch monitored envelopes data
  const monitoredEnvelopesData = await db
    .with(rankedComplianceForms)
    .select()
    .from(monitoredEnvelopes)
    .leftJoin(rankedComplianceForms,
      and(
        eq(monitoredEnvelopes.envelopeId, rankedComplianceForms.envelopeId),
        eq(rankedComplianceForms.rn, 1)
      )
    )
    .where(eq(monitoredEnvelopes.accountId, params.accountId));

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Compliance Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Organization Name</p>
              <p className="font-semibold">{accountInfo[0].docuSignAccountName}</p>
            </div>
            {/* <div>
              <p className="text-gray-600">DocuSign Account</p>
              <p className="font-mono">{accountInfo[0].docuSignAccountId}</p>
            </div> */}
            <div>
              <p className="text-gray-600">Region</p>
              <p className="font-semibold">{COUNTRIES.filter(c => c.value === accountInfo[0].country)[0].name}</p>
            </div>

            <div>
              <p className="text-gray-600"></p>
              <p className="font-semibold">{COUNTRIES.filter(c => c.value === accountInfo[0].country)[0].name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Monitored Documents</h2>
        </div>
        <div className="grid gap-6">
          {monitoredEnvelopesData.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Get Started with CompliSign</h3>
                  <p className="text-gray-600">Set up your NGO's compliance monitoring system in three easy steps</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Connect Your Documents</h4>
                      <p className="text-gray-600 mb-3">Import your DocuSign documents to begin compliance tracking</p>
                      <a href={`/dash/${params.accountId}/import`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Connect Documents
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full font-semibold">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Set Up Compliance Team</h4>
                      <p className="text-gray-600">Assign officers to manage document compliance and reviews</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-semibold">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Configure Review Cycles</h4>
                      <p className="text-gray-600">Set up automated review schedules for grants and funding documents</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Read our NGO compliance management guide
                  </a>
                </div>
              </div>
            </div>
          ) : (

          <div className="grid">
            {monitoredEnvelopesData.map(({monitored_envelopes: envelope, mostRecentComplianceForms}) => {
              const isOverdue = new Date(envelope.nextReviewDate) < new Date();
              const envelopeInfo = envelope.additionalInfo;

              return (
                <div
                  key={envelope.envelopeId}
                  className={`bg-white p-6 rounded-lg border shadow border-l-4 ${isOverdue ? 'border-red-500' :
                    envelope.isFundingDocument ? 'border-green-500' :
                      'border-blue-500'
                    }`}
                >
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h3 className="text-lg font-semibold cursor-help">{envelopeInfo.emailSubject || 'Untitled Document'}</h3>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Document subject from DocuSign</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`px-3 py-1 rounded-full text-sm cursor-help w-full text-center ${envelopeInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                                envelopeInfo.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                                {envelopeInfo.status === 'completed' ? 'Completed' :
                                 envelopeInfo.status === 'sent' ? 'In Progress' :
                                 'Draft'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{envelopeInfo.status === 'completed' ? 'All parties have signed the document' :
                                envelopeInfo.status === 'sent' ? 'Document has been sent for signatures' :
                                'Document is in draft state'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`px-3 py-1 rounded-full text-sm cursor-help w-full text-center ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                {isOverdue ? 'Review Required' : 'Monitoring Active'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isOverdue ? 'Document requires immediate compliance review' : 'Document is being actively monitored for compliance'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`px-3 py-1 rounded-full text-sm cursor-help w-full text-center ${envelope.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {envelope.isProcessed ? 'Analysis Complete' : 'Analysis Pending'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{envelope.isProcessed ? 'Document has been analyzed for compliance requirements' : 'Document is queued for compliance analysis'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`px-3 py-1 rounded-full text-sm cursor-help w-full text-center ${
                                envelope.isFundingDocument ? 'bg-emerald-100 text-emerald-800' :
                                envelope.isFundingDocument === false ? 'bg-gray-100 text-gray-600' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {envelope.isFundingDocument ? 'Grant/Funding' :
                                 envelope.isFundingDocument === false ? 'Standard Document' :
                                 'Document Type Pending'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{envelope.isFundingDocument ? 'This document is related to grants or funding' :
                                envelope.isFundingDocument === false ? 'Regular compliance document' :
                                'Document type needs to be classified'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <TooltipProvider>
                          <div className="space-y-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-700">Created</p>
                                  <p>{new Date(envelopeInfo.createdDateTime).toLocaleString()}</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>When the document was created in DocuSign</p>
                              </TooltipContent>
                            </Tooltip>

                            {envelopeInfo.sentDateTime && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Sent</p>
                                    <p>{new Date(envelopeInfo.sentDateTime).toLocaleString()}</p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>When the document was sent for signatures</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {envelopeInfo.completedDateTime && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Completed</p>
                                    <p>{new Date(envelopeInfo.completedDateTime).toLocaleString()}</p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>When all parties completed signing</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          <div className="space-y-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-700">Compliance Officer</p>
                                  <p>{envelope.complianceOfficerEmail}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Last notified: {mostRecentComplianceForms?.emailSentAt ? 
                                      new Date(mostRecentComplianceForms.emailSentAt).toLocaleString() : 
                                      'Never'}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Officer responsible for compliance review and their last notification time</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-700">Next Review Date</p>
                                  <p className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                    {new Date(envelope.nextReviewDate).toLocaleString()}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>When this document needs to be reviewed next for compliance</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="space-y-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-700">Total Funding</p>
                                  <p>${envelope.moneyReceivedTillDate?.toLocaleString() || '0'}</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Total funding amount associated with this document</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help bg-gray-50 p-3 rounded-lg">
                                  <p className="font-medium text-gray-700">Compliance Form Status</p>
                                  <p className="text-gray-600">Not Available</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Status of the latest compliance review form</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <CollapsibleDetails envelope={envelope} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
