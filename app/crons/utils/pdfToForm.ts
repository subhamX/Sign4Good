import { readFileSync } from 'fs';
import { z } from 'zod';
import OpenAI from 'openai';
import { db } from '@/drizzle/db-config';
import { complianceForms, monitoredEnvelopes } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getNextPublishDates } from './getNextPublishDates';
import dayjs from 'dayjs';


// don't change please!!! https://gitlab.com/autokent/pdf-parse/-/issues/24
const pdf = require('pdf-parse')

export async function parsePDF(file: Buffer): Promise<string> {
    try {
        const data = await pdf(file);
        return data.text;
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw error;
    }
}

// Base validation schema that applies to all field types
const BaseValidation = z.object({
    required: z.boolean().default(false),
    custom_error: z.string().optional(),
});

// Specific validation schemas for different field types
const TextValidation = BaseValidation.extend({
    min_length: z.number().optional(),
    max_length: z.number().optional(),
    pattern: z.string().optional(),
});

const NumberValidation = BaseValidation.extend({
    min: z.number().optional(),
    max: z.number().optional(),
    integer_only: z.boolean().default(false),
});

const DateValidation = BaseValidation.extend({
    min_date: z.string().datetime().optional().nullable(),
    max_date: z.string().datetime().optional().nullable(),
    future_only: z.boolean().default(false),
    past_only: z.boolean().default(false),
});

const SelectValidation = BaseValidation.extend({
    min_selections: z.number().optional(),
    max_selections: z.number().optional(),
});

// Field type-specific schemas
const TextField = z.object({
    type: z.literal('text_field'),
    validation: TextValidation,
});

const TextareaField = z.object({
    type: z.literal('textarea'),
    validation: TextValidation,
    rows: z.number().default(3),
});

const NumberField = z.object({
    type: z.literal('number_field'),
    validation: NumberValidation,
});

const DateField = z.object({
    type: z.literal('date_field'),
    validation: DateValidation,
});

const CheckboxField = z.object({
    type: z.literal('checkbox'),
    validation: BaseValidation,
    default: z.boolean().default(false),
});

const SingleSelectField = z.object({
    type: z.literal('single_select'),
    validation: BaseValidation,
    options: z.array(z.string()).min(1),
    default_value: z.string().optional(),
});

const MultiSelectField = z.object({
    type: z.literal('multi_select'),
    validation: SelectValidation,
    options: z.array(z.string()).min(1),
    default_values: z.array(z.string()).optional(),
});

// Combined field type discriminated union
export const SignForGoodWebFormTypeUnion = z.discriminatedUnion('type', [
    TextField,
    TextareaField,
    NumberField,
    DateField,
    CheckboxField,
    SingleSelectField,
    MultiSelectField,
]);

// Main form field schema
export const FormFieldSchema = z.object({
    label: z.string(),
    name: z.string().regex(/^[a-z0-9_]+$/i, 'Field name must contain only letters, numbers, and underscores'),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    proof_required: z.boolean().default(false),
    proof_description: z.string().optional(),
}).and(SignForGoodWebFormTypeUnion);

// type SignForGoodWebFormTypeUnionType = z.infer<typeof SignForGoodWebFormTypeUnion>;

export type FormField = z.infer<typeof FormFieldSchema>;

const FormFieldsResponseSchema = z.array(FormFieldSchema);



export async function fetchFormFields(contractText: string): Promise<FormField[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Imagine you are a professional and meticulous Compliance Officer tasked with creating a standardized reporting template for a new organizational partnership. Analyze the provided contract text with the following objectives:

        1. Identify key compliance requirements and reporting obligations
        2. Extract stakeholder information without relying on specific company names
        3. Determine critical verification points that ensure partnership integrity
        4. Generate form fields that capture essential compliance data

        Your form fields should:
        - Be generic enough to work across different organizational contexts
        - Focus on universal compliance principles
        - Use clear, professional language
        - Provide guidance through placeholders and descriptions
        - Offer flexibility for various partnership types
        - Indicate which fields require proof documentation
        - Reminders about donation clauses and inquire progress to achivement
        - Extract the Amount of funding till date
        - Brief summary of the entire document
        - Also mention jurisdiction based compliance requirements that may not have been covered in the document

  Create form fields and return them in a JSON object with this structure:
  {
    "fields": [
      {
        "label": "Human readable label",
        "name": "machine_readable_name", // only letters, numbers, underscores
        "description": "Optional help text explaining the field",
        "type": "text_field" | "textarea" | "number_field" | "date_field" | "checkbox" | "single_select" | "multi_select",
        "placeholder": "Helpful placeholder text",
        "proof_required": boolean,
        "proof_description": "What kind of proof is needed",
        
        // For text_field/textarea:
        "validation": {
          "required": boolean,
          "min_length": number,
          "max_length": number,
          "pattern": "regex pattern",
          "custom_error": "Custom error message"
        },

        // For number_field:
        "validation": {
          "required": boolean,
          "min": number,
          "max": number,
          "integer_only": boolean,
          "custom_error": "Custom error message"
        },

        // For date_field:
        "validation": {
          "required": boolean,
          "min_date": "2024-01-01T00:00:00.000Z", // ISO 8601 format example
          "max_date": "2025-12-31T23:59:59.999Z", // ISO 8601 format example
          "future_only": boolean,
          "past_only": boolean,
          "custom_error": "Custom error message"
        },

        // For single_select/multi_select:
        "options": ["option1", "option2", ...],
        "validation": {
          "required": boolean,
          "min_selections": number, // for multi_select
          "max_selections": number, // for multi_select
          "custom_error": "Custom error message"
        },
        "default_value": "option1", // for single_select
        "default_values": ["option1", "option2"], // for multi_select

        // For checkbox:
        "validation": {
          "required": boolean,
          "custom_error": "Custom error message"
        },
        "default": boolean
      }
    ]
  }

  Contract Text to Analyze:
  ${contractText}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error("No content received from OpenAI");
        }

        console.log("Raw OpenAI response:", content);

        const parsedContent = JSON.parse(content);
        // Expect the fields to be in a 'fields' property of the response
        const fields = parsedContent.fields;

        if (!Array.isArray(fields)) {
            throw new Error("Expected fields to be an array");
        }

        const validatedFields = FormFieldsResponseSchema.parse(fields);
        return validatedFields;
    } catch (error) {
        console.error("Error generating or validating form fields:", error);
        throw new Error("Failed to generate valid form fields");
    }
}
