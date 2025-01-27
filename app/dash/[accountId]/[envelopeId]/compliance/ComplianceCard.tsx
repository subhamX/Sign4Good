'use client'
import { format } from "date-fns"
import { FORM_DETAILS_ROUTE } from "@/routes.config"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function ComplianceCardClient({ form, envelopeInfo }: { 
  form: any, 
  envelopeInfo: { 
    complianceOfficerEmail: string,
    donorOfficerEmail: string,
    briefDescription: string | null
  } 
}) {
  const { toast } = useToast()
  const router = useRouter()
  
  let status = 'Awaiting Compliance Review'
  let statusColor = 'bg-yellow-100 text-yellow-800'

  if (form.filledByComplianceOfficerAt) {
    if (form.signedByDonorAt) {
      status = 'Review Complete'
      statusColor = 'bg-green-100 text-green-800'
    } else {
      status = 'Pending Donor Confirmation'
      statusColor = 'bg-blue-100 text-blue-800'
    }
  }

  const handleCopyLink = () => {
    const formLink = `${window.location.origin}/compliance-form/${form.id}`
    navigator.clipboard.writeText(formLink)
    toast({
      title: "Link Copied",
      description: "Form link has been copied to clipboard",
    })
  }

  const handleRemindOfficer = () => {
    toast({
      title: "Reminder Sent",
      description: `A reminder email has been sent to ${envelopeInfo.complianceOfficerEmail}`,
    })
  }

  const handleViewDetails = () => {
    router.push(FORM_DETAILS_ROUTE(form.id.toString()))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Form #{form.id}</h3>
          <p className="text-sm text-gray-500">
            Created on {format(new Date(form.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Compliance Officer</p>
            <p className="text-sm text-gray-900">{envelopeInfo.complianceOfficerEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Donor Officer</p>
            <p className="text-sm text-gray-900">{envelopeInfo.donorOfficerEmail}</p>
          </div>
        </div>

        {envelopeInfo.briefDescription && (
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm text-gray-900">{envelopeInfo.briefDescription}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-500">Due Date</p>
          <p className="text-sm text-gray-900">{format(new Date(form.dueDate), 'MMM dd, yyyy')}</p>
        </div>

        {form.filledByComplianceOfficerAt && (
          <div>
            <p className="text-sm font-medium text-gray-500">Reviewed by Compliance Officer</p>
            <p className="text-sm text-gray-900">
              {format(new Date(form.filledByComplianceOfficerAt), 'MMM dd, yyyy')}
            </p>
          </div>
        )}

        {form.signedByDonorAt && (
          <div>
            <p className="text-sm font-medium text-gray-500">Signed by Donor</p>
            <p className="text-sm text-gray-900">
              {format(new Date(form.signedByDonorAt), 'MMM dd, yyyy')}
            </p>
          </div>
        )}

        <div className="pt-4 flex space-x-4">
          <button 
            onClick={handleCopyLink}
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md"
          >
            Copy Form Link
          </button>
          {!form.filledByComplianceOfficerAt && (
            <button 
              onClick={handleRemindOfficer}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 px-4 py-2 rounded-md border border-indigo-600 hover:border-indigo-500"
            >
              Send Reminder
            </button>
          )}
          <button 
            onClick={handleViewDetails}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 ml-auto"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  )
}
