import { getUserInServer } from "@/app/utils/setAuthTokenAsCookie";
import { db } from "@/drizzle/db-config";
import { accounts, complianceForms, monitoredEnvelopes, usersToAccountsBridgeTable } from "@/drizzle/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DASH_ACCOUNT_COMPLIANCE_ROUTE, LANDING_ROUTE } from "@/routes.config";
import { CollapsibleDetails } from "./CollapsibleDetails";
import { HyperText } from "@/components/ui/hypertext";
import { BorderBeam } from "@/components/ui/border-beam";
import { Import } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COUNTRIES } from "@/app/onboarding/countries";
import Link from "next/link";
import { UserCircle, Users, Calendar, ClipboardCheck } from "lucide-react";

export default async function AccountDashboard({
  params
}: {
  params: Promise<{ accountId: string }>
}) {
  const user = await getUserInServer();
  if (!user) {
    redirect(LANDING_ROUTE);
  }

  const { accountId } = await params;

  // Get account info
  const accountInfo = await db
    .select()
    .from(accounts)
    .innerJoin(usersToAccountsBridgeTable, eq(accounts.docuSignAccountId, usersToAccountsBridgeTable.accountId))
    .where(
      and(
        eq(accounts.docuSignAccountId, accountId),
        eq(usersToAccountsBridgeTable.userId, user.docusignId)
      )
    );

  if (accountInfo.length === 0) {
    redirect(LANDING_ROUTE);
  }

  const rankedComplianceForms = db.$with("mostRecentComplianceForms").as(
    db
      .select({
        envelopeId: complianceForms.envelopeId,
        createdAt: complianceForms.createdAt,
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
    .where(eq(monitoredEnvelopes.accountId, accountId));

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Compliance Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Organization Name</p>
              <p className="font-semibold">{accountInfo[0].enterprise_info.docuSignAccountName}</p>
            </div>
            {/* <div>
              <p className="text-gray-600">DocuSign Account</p>
              <p className="font-mono">{accountInfo[0].docuSignAccountId}</p>
            </div> */}
            <div>
              <p className="text-gray-600">Region</p>
              <p className="font-semibold">{COUNTRIES.filter(c => c.value === accountInfo[0].enterprise_info.country)[0].name}</p>
            </div>

            <div>
              <p className="text-gray-600">Part of global leaderboard</p>
              <p className="font-semibold">{accountInfo[0].enterprise_info.includeInLeaderBoard ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Donation Agreements</h2>
          <a href={`/dash/${accountId}/import`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Import Documents
            <Import className="w-5 h-5 ml-2 group-hover:text-white" />
          </a>
        </div>
        <div className="grid gap-6">
          {monitoredEnvelopesData.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <HyperText className="text-2xl font-semibold text-gray-800 mb-3">Get Started with SignForGood</HyperText>
                  <p className="text-gray-600">Set up your NGO's compliance monitoring system in three easy steps</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Connect Your Documents</h4>
                      <p className="text-gray-600 mb-3">Import your DocuSign documents to begin compliance tracking</p>
                      <a href={`/dash/${accountId}/import`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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

            <div className="grid gap-5">
              {monitoredEnvelopesData.map(({ monitored_envelopes: envelope, mostRecentComplianceForms }) => {
                const isOverdue = new Date(envelope.nextReviewDate) < new Date();
                const envelopeInfo = envelope.additionalInfo;

                return (
                  <div key={envelope.envelopeId} className="relative group/card">
                    <Link href={DASH_ACCOUNT_COMPLIANCE_ROUTE(accountId, envelope.envelopeId)}>
                      <div
                        className={`bg-white p-6 rounded-t-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                          isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
                        }`}
                      >
                        <div className="flex flex-col gap-6">
                          {/* Header Section */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <h3 className="text-xl font-semibold cursor-help group-hover:text-primary/90 transition-colors">
                                      {envelopeInfo.emailSubject || 'Untitled Document'}
                                    </h3>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Document subject from DocuSign</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <p className="text-sm text-muted-foreground mt-1">
                                Created {new Date(envelopeInfo.createdDateTime).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                ${envelope.moneyReceivedTillDate?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    envelopeInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    envelopeInfo.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {envelopeInfo.status === 'completed' ? 'Completed' :
                                     envelopeInfo.status === 'sent' ? 'In Progress' : 'Draft'}
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
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    isOverdue ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {isOverdue ? 'Review Required' : 'Monitoring Active'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isOverdue ? 'Document requires immediate compliance review' : 'Document is being actively monitored for compliance'}</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    envelope.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {envelope.isProcessed ? 'Analysis Complete' : 'Analysis Pending'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{envelope.isProcessed ? 'Document has been analyzed for compliance requirements' : 'Document is queued for compliance analysis'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Main Content Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Officers */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <UserCircle className="w-5 h-5 text-primary/70" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Compliance Officer</p>
                                  <p className="text-sm text-gray-600">{envelope.complianceOfficerEmail}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <Users className="w-5 h-5 text-primary/70" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Donor Officer</p>
                                  <p className="text-sm text-gray-600">{envelope.donorOfficerEmail}</p>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Dates & Status */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <Calendar className="w-5 h-5 text-primary/70" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Next Review</p>
                                  <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                    {new Date(envelope.nextReviewDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/5">
                                  <ClipboardCheck className="w-5 h-5 text-primary/70" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Compliance Status</p>
                                  <p className="text-sm text-gray-600">Not Available</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Collapsible Details - Outside the Link */}
                    <div 
                      className="px-6 pb-6 border-l-4 border-l-green-500 bg-white rounded-b-xl border-x border-b shadow-sm transition-colors"
                    >
                      <div className="pt-4 border-t">
                        <CollapsibleDetails envelope={envelope} />
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
