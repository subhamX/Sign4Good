import { FormField } from '@/app/crons/utils/pdfToForm';
import { EnvelopeDocuSign } from '@/app/dash/[accountId]/envelopes.server';
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';


// Users table to store DocuSign authenticated users
export const users = pgTable('users', {
  docusignId: text('docusign_id').unique().notNull().primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),

  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),

  // isOnboarded: boolean('is_onboarded').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersToAccountsBridgeTable = pgTable('users_to_accounts_bridge', {
  userId: text('user_id').references(() => users.docusignId).notNull(),
  accountId: text('account_id').references(() => accounts.docuSignAccountId).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.accountId] })
}));

export const accounts = pgTable('enterprise_info', {
  docuSignAccountName: text('name').notNull(),
  docuSignAccountId: text('docu_sign_account_id').notNull().primaryKey(),
  docuSignBaseUrl: text('docu_sign_base_url').notNull(),

  donationLink: text('donation_link').notNull(),

  country: text('country').notNull(),
  score: integer('score').default(-1).notNull(), // -1 means not calculated yet
  includeInLeaderBoard: boolean('include_in_leader_board').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const monitoredEnvelopes = pgTable('monitored_envelopes', {
  envelopeId: text('envelope_id').notNull().primaryKey(),
  accountId: text('account_id').references(() => accounts.docuSignAccountId).notNull(),
  complianceOfficerEmail: text('compliance_officer_email').notNull(),
  donorOfficerEmail: text('donor_officer_email').notNull(),
  monitoringFrequencyDays: integer('monitoring_frequency_days').notNull(),

  nextReviewDate: timestamp('next_review_date').notNull(),

  isProcessed: boolean('is_processed').default(false).notNull(),

  // isFundingDocument: boolean('is_funding_document').default(false).notNull(),

  moneyReceivedTillDate: integer('money_received_till_date').default(0).notNull(),

  briefDescription: text('brief_description'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by').references(() => users.docusignId).notNull(),

  additionalInfo: jsonb('additional_info').$type<EnvelopeDocuSign>().notNull(),
});


export const complianceForms = pgTable('compliance_forms', {
  id: serial('id').primaryKey(),
  envelopeId: text('envelope_id').references(() => monitoredEnvelopes.envelopeId).notNull(),

  generatedSchema: jsonb('form_data').$type<FormField[]>().notNull(),
  submittedFormData: jsonb('submitted_form_data').$type<Record<string, any>>(),

  // isCompleted: boolean('is_completed').default(false).notNull(),



  dueDate: timestamp('due_date', {mode: 'string'}).notNull(),
  createdAt: timestamp('created_at', {mode: 'string'}).defaultNow().notNull(),
  filledByComplianceOfficerAt: timestamp('filled_by_compliance_officer_at', {mode: 'string'}),
  emailSentToDonorAt: timestamp('email_sent_to_donor_at', {mode: 'string'}),
  emailSentToDonorEnvelopeId: text('email_sent_to_donor_envelope_id'),
  signedByDonorAt: timestamp('signed_by_donor_at', {mode: 'string'}),
});


// // db.select().from(enterpriseInfo).where(country) // no pagination

// // envelopes; we won't add it automatically, rather the user will bulk import them.
// export const envelopes = pgTable('envelopes', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').references(() => users.docusignId),

//   name: text('name').notNull(), // copied from docuSign
//   envelopeId: text('envelope_id').notNull(), // same as docuSign envelopId
//   status: text('status').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// // compliance forms



// // Forms table to store compliance questionnaires
// export const forms = pgTable('forms', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').references(() => users.id),
//   title: text('title').notNull(),
//   status: text('status').notNull(), // 'pending' or 'completed'
//   dueDate: timestamp('due_date'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull()
// });

// // Form responses table to store actual form data
// export const formResponses = pgTable('form_responses', {
//   id: serial('id').primaryKey(),
//   formId: integer('form_id').references(() => forms.id),
//   questionId: text('question_id').notNull(),
//   response: text('response').notNull(),
//   isCompliant: boolean('is_compliant').default(true),
//   createdAt: timestamp('created_at').defaultNow().notNull()
// });

// // Donations table to track non-profit donations
// export const donations = pgTable('donations', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id').references(() => users.id),
//   amount: integer('amount').notNull(),
//   date: timestamp('date').defaultNow().notNull(),
//   description: text('description')
// });