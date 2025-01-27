import { FormField } from "@/app/crons/utils/pdfToForm";
import dayjs from "dayjs";
import { z } from "zod";



// export const validationSchema =     // Dynamically generate validation schema based on form fields
export const getValidationSchemaFromSchema = (schema: FormField[]) => z.object(
    schema.reduce<Record<string, z.ZodTypeAny>>((acc, field: FormField) => {
        let fieldSchema;
        switch (field.type) {
            case 'text_field':
            case 'textarea':
                fieldSchema = z.string();
                if (field.validation.min_length) fieldSchema = fieldSchema.min(field.validation.min_length);
                if (field.validation.max_length) fieldSchema = fieldSchema.max(field.validation.max_length);
                if (field.validation.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
                break;
            case 'number_field':
                fieldSchema = field.validation.integer_only ? z.number().int() : z.number();
                if (field.validation.min !== undefined) fieldSchema = fieldSchema.min(field.validation.min);
                if (field.validation.max !== undefined) fieldSchema = fieldSchema.max(field.validation.max);
                break;
            case 'date_field':
                fieldSchema = z.string();
                if (field.validation.min_date) {
                    const minDate = dayjs(field.validation.min_date);
                    fieldSchema = fieldSchema.refine(
                        (date) => dayjs(date).isAfter(minDate) || dayjs(date).isSame(minDate),
                        { message: `Date must be after or equal to ${minDate.format('YYYY-MM-DD')}` }
                    );
                }
                if (field.validation.max_date) {
                    const maxDate = dayjs(field.validation.max_date);
                    fieldSchema = fieldSchema.refine(
                        (date) => dayjs(date).isBefore(maxDate) || dayjs(date).isSame(maxDate),
                        { message: `Date must be before or equal to ${maxDate.format('YYYY-MM-DD')}` }
                    );
                }
                break;
            case 'checkbox':
                fieldSchema = z.boolean();
                break;
            case 'single_select':
                fieldSchema = z.enum(field.options as [string, ...string[]]);
                break;
            case 'multi_select':
                fieldSchema = z.array(z.string());
                if (field.validation.min_selections) fieldSchema = fieldSchema.min(field.validation.min_selections);
                if (field.validation.max_selections) fieldSchema = fieldSchema.max(field.validation.max_selections);
                break;
            default:
                fieldSchema = z.string();
        }

        if (field.validation.required) {
            acc[field.name] = fieldSchema.pipe(z.string().min(1, { message: "This field is required" }));
        } else {
            acc[field.name] = fieldSchema.optional();
        }

        // Add validation for proof field if required
        if (field.proof_required) {
            acc[`${field.name}_proof`] = field.validation.required
                ? z.any().refine((files) => files?.length > 0, "Proof document is required")
                : z.any().optional();
        }

        return acc;
    }, {})
);