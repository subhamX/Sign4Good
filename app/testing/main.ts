import { db } from "@/drizzle/db-config"
import { accounts, monitoredEnvelopes, complianceForms } from "@/drizzle/schema"
import { sql } from "drizzle-orm"
import { EnvelopeDocuSign } from '@/app/dash/[accountId]/envelopes.server'
import { FormField } from '@/app/crons/utils/pdfToForm'

const NGO_DATA = [
    {
        name: "Rainforest Alliance",
        id: "ra-2024",
        baseUrl: "https://docusign.rainforestalliance.org",
        donationLink: "https://donate.rainforest-alliance.org",
        country: "Brazil",
        description: "Forest conservation and sustainable agriculture"
    },
    {
        name: "Ocean Conservation Trust",
        id: "oct-2024",
        baseUrl: "https://docusign.oceanconservation.org",
        donationLink: "https://donate.oceanconservation.org",
        country: "Australia",
        description: "Marine ecosystem protection and research"
    },
    {
        name: "Wildlife Protection Fund",
        id: "wpf-2024",
        baseUrl: "https://docusign.wildlifeprotection.org",
        donationLink: "https://donate.wildlife-protection.org",
        country: "Kenya",
        description: "Wildlife conservation and anti-poaching initiatives"
    },
    {
        name: "Clean Energy Initiative",
        id: "cei-2024",
        baseUrl: "https://docusign.cleanenergy.org",
        donationLink: "https://donate.clean-energy.org",
        country: "Germany",
        description: "Renewable energy projects in developing nations"
    },
    {
        name: "Education For All",
        id: "efa-2024",
        baseUrl: "https://docusign.educationforall.org",
        donationLink: "https://donate.education-for-all.org",
        country: "India",
        description: "Rural education and teacher training programs"
    },
    {
        name: "Clean Water Access",
        id: "cwa-2024",
        baseUrl: "https://docusign.cleanwateraccess.org",
        donationLink: "https://donate.clean-water.org",
        country: "Ethiopia",
        description: "Water purification and well construction projects"
    },
    {
        name: "Sustainable Agriculture Network",
        id: "san-2024",
        baseUrl: "https://docusign.sustainableag.org",
        donationLink: "https://donate.sustainable-agriculture.org",
        country: "Mexico",
        description: "Promoting sustainable farming practices"
    },
    {
        name: "Climate Action Coalition",
        id: "cac-2024",
        baseUrl: "https://docusign.climateaction.org",
        donationLink: "https://donate.climate-action.org",
        country: "Netherlands",
        description: "Climate change mitigation and adaptation"
    },
    {
        name: "Healthcare Access Initiative",
        id: "hai-2024",
        baseUrl: "https://docusign.healthcareaccess.org",
        donationLink: "https://donate.healthcare-access.org",
        country: "Uganda",
        description: "Rural healthcare and medical training"
    },
    {
        name: "Women Empowerment Foundation",
        id: "wef-2024",
        baseUrl: "https://docusign.womenempowerment.org",
        donationLink: "https://donate.women-empowerment.org",
        country: "Bangladesh",
        description: "Women's education and entrepreneurship"
    }
]

// Create 10 accounts with realistic NGO data
const createAccounts = async () => {
    console.log("Creating accounts...")
    await db.insert(accounts)
        .values(NGO_DATA.map(ngo => ({
            docuSignAccountName: ngo.name,
            docuSignAccountId: ngo.id,
            docuSignBaseUrl: ngo.baseUrl,
            donationLink: ngo.donationLink,
            country: ngo.country,
            score: 0,
            includeInLeaderBoard: true,
            createdAt: new Date()
        })))
        .onConflictDoUpdate({
            target: [accounts.docuSignAccountId],
            set: {
                docuSignAccountName: sql.raw(`excluded.${accounts.docuSignAccountName.name}`),
                docuSignBaseUrl: sql.raw(`excluded.${accounts.docuSignBaseUrl.name}`),
                donationLink: sql.raw(`excluded.${accounts.donationLink.name}`),
                country: sql.raw(`excluded.${accounts.country.name}`)
            }
        })
}

const ENVELOPE_TYPES = [
    { type: "Grant Proposal", amount: 50000 },
    { type: "Project Report", amount: 0 },
    { type: "Budget Update", amount: 25000 },
    { type: "Impact Assessment", amount: 0 },
    { type: "Financial Statement", amount: 75000 },
    { type: "Partnership Agreement", amount: 100000 },
    { type: "Quarterly Review", amount: 0 },
    { type: "Funding Request", amount: 150000 },
    { type: "Compliance Report", amount: 0 },
    { type: "Strategic Plan", amount: 200000 }
]

// Create 10 envelopes for each account
const createEnvelopes = async () => {
    console.log("Creating envelopes...")
    const envelopesToCreate = NGO_DATA.flatMap(ngo => 
        ENVELOPE_TYPES.map((envType, index) => {
            const now = new Date()
            const docuSignInfo: EnvelopeDocuSign = {
                envelopeId: `${ngo.id}-env-${index + 1}`,
                status: Math.random() > 0.5 ? "completed" : "in_progress",
                emailSubject: `${envType.type} - ${ngo.name}`,
                emailBlurb: "",
                purgeState: "unpurged",
                envelopeUri: "/envelope",
                documentsUri: "/documents",
                recipientsUri: "/recipients",
                attachmentsUri: "/attachments",
                customFieldsUri: "/custom_fields",
                notificationUri: "/notification",
                documentsCombinedUri: "/documents/combined",
                certificateUri: "/certificate",
                templatesUri: "/templates",
                expireEnabled: "true",
                expireDateTime: "",
                expireAfter: "120",
                signingLocation: "online",
                enableWetSign: "true",
                allowMarkup: "false",
                allowReassign: "true",
                createdDateTime: now.toISOString(),
                lastModifiedDateTime: now.toISOString(),
                initialSentDateTime: now.toISOString(),
                sentDateTime: now.toISOString(),
                completedDateTime: Math.random() > 0.5 ? now.toISOString() : "",
                statusChangedDateTime: now.toISOString(),
                sender: {
                    userName: "System",
                    userId: "system",
                    email: "system@complisign.org"
                },
                customFields: {
                    textCustomFields: [],
                    listCustomFields: []
                },
                is21CFRPart11: false,
                isSignatureProviderEnvelope: false,
                allowViewHistory: true,
                hasFormDataChanged: false,
                allowComments: true,
                hasComments: false,
                envelopeLocation: "current",
                isDynamicEnvelope: false
            }

            return {
                envelopeId: `${ngo.id}-env-${index + 1}`,
                accountId: ngo.id,
                complianceOfficerEmail: `compliance@${ngo.id}.org`,
                donorOfficerEmail: `donor@${ngo.id}.org`,
                monitoringFrequencyDays: 30,
                nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isProcessed: Math.random() > 0.5,
                moneyReceivedTillDate: envType.amount * (Math.random() > 0.5 ? 0.5 : 1),
                briefDescription: `${envType.type} for ${ngo.description}`,
                createdAt: now,
                createdBy: "e7dc44cd-8cff-4480-899c-3d7d292b543b",
                additionalInfo: docuSignInfo
            }
        })
    )

    await db.insert(monitoredEnvelopes)
        .values(envelopesToCreate)
        .onConflictDoUpdate({
            target: monitoredEnvelopes.envelopeId,
            set: {
                isProcessed: sql.raw(`EXCLUDED."${monitoredEnvelopes.isProcessed.name}"`),
                moneyReceivedTillDate: sql.raw(`EXCLUDED."${monitoredEnvelopes.moneyReceivedTillDate.name}"`),
                nextReviewDate: sql.raw(`EXCLUDED."${monitoredEnvelopes.nextReviewDate.name}"`),
                additionalInfo: sql.raw(`EXCLUDED."${monitoredEnvelopes.additionalInfo.name}"`)
            }
        })
}

const FORM_TYPES = [
    {
        type: "Financial Compliance",
        fields: [
            { name: "budget_adherence", label: "Budget Adherence", type: "checkbox", proof_required: true },
            { name: "expense_documentation", label: "Expense Documentation", type: "checkbox", proof_required: true },
            { name: "audit_reports", label: "Audit Reports Submitted", type: "checkbox", proof_required: true }
        ] as FormField[]
    },
    {
        type: "Project Progress",
        fields: [
            { name: "milestone_completion", label: "Milestone Completion", type: "text_field", proof_required: true, validation: { required: true } },
            { name: "beneficiary_reach", label: "Beneficiary Reach", type: "text_field", proof_required: true, validation: { required: true } },
            { name: "timeline_adherence", label: "Timeline Adherence", type: "checkbox", proof_required: true }
        ] as FormField[]
    },
    {
        type: "Impact Assessment",
        fields: [
            { name: "target_achievement", label: "Target Achievement", type: "text_field", proof_required: true, validation: { required: true } },
            { name: "community_feedback", label: "Community Feedback", type: "text_field", proof_required: true, validation: { required: true } },
            { name: "sustainability_measure", label: "Sustainability Measure", type: "text_field", proof_required: true, validation: { required: true } }
        ] as FormField[]
    }
]

// Create 3 compliance forms for each envelope
const createComplianceForms = async () => {
    console.log("Creating compliance forms...")
    const formsToCreate = NGO_DATA.flatMap(ngo => 
        ENVELOPE_TYPES.flatMap((envType, envIndex) => 
            FORM_TYPES.map((formType, formIndex) => {
                const isCompleted = Math.random() > 0.4
                const now = new Date()
                const dueDate = new Date(now.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000)
                
                return {
                    envelopeId: `${ngo.id}-env-${envIndex + 1}`,
                    generatedSchema: formType.fields,
                    submittedFormData: isCompleted ? formType.fields.reduce((acc, field) => ({
                        ...acc,
                        [field.name]: field.type === 'checkbox' ? Math.random() > 0.5 :
                                  field.type === 'text_field' ? "Sample response" : "Sample response"
                    }), {}) : null,
                    dueDate: dueDate.toISOString(),
                    createdAt: now.toISOString(),
                    filledByComplianceOfficerAt: isCompleted ? new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : null,
                    emailSentToDonorAt: isCompleted ? new Date(now.getTime() - Math.random() * 9 * 24 * 60 * 60 * 1000).toISOString() : null,
                    emailSentToDonorEnvelopeId: isCompleted ? `${ngo.id}-env-${envIndex + 1}-notification` : null,
                    signedByDonorAt: isCompleted ? new Date(now.getTime() - Math.random() * 8 * 24 * 60 * 60 * 1000).toISOString() : null
                }
            })
        )
    )

    await db.insert(complianceForms)
        .values(formsToCreate)
        .onConflictDoUpdate({
            target: [complianceForms.id],
            set: {
                submittedFormData: sql.raw(`EXCLUDED."${complianceForms.submittedFormData.name}"`),
                filledByComplianceOfficerAt: sql.raw(`EXCLUDED."${complianceForms.filledByComplianceOfficerAt.name}"`),
                emailSentToDonorAt: sql.raw(`EXCLUDED."${complianceForms.emailSentToDonorAt.name}"`),
                emailSentToDonorEnvelopeId: sql.raw(`EXCLUDED."${complianceForms.emailSentToDonorEnvelopeId.name}"`),
                signedByDonorAt: sql.raw(`EXCLUDED."${complianceForms.signedByDonorAt.name}"`)
            }
        })
}

const main = async () => {
    await createAccounts()
    await createEnvelopes()
    await createComplianceForms()
    console.log("Seeding completed!")
}

main().catch(console.error)