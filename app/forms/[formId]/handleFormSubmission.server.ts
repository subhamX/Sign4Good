'use server'

import { UTApi } from "uploadthing/server"; 
import { db } from "@/drizzle/db-config";
import { eq } from "drizzle-orm";
import { complianceForms } from "@/drizzle/schema";
import { z } from "zod";
import { getValidationSchemaFromSchema } from "./validationSchema";

export const handleFormSubmission = async (formDataInstance: Record<string, any>, formId: number) => {
    const formActualData = await db.select().from(complianceForms).where(eq(complianceForms.id, formId));
    if(!formActualData.length) {
        return {
            error: "Form not found"
        }
    }

    // validate formDataInstance with formActualData.schema
    const formSchema = formActualData[0].generatedSchema;
    const validatedForm = getValidationSchemaFromSchema(formSchema);
    const parsedFormData = validatedForm.parse(formDataInstance);

    console.log(parsedFormData);

    // Process file attachments
    const ut = new UTApi();
    const processedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(parsedFormData)) {
        if (Array.isArray(value) && value.length && value[0] instanceof File) {
            if(value.length > 1) {
                return {
                    error: "Only one file is allowed"
                }
            }

            try {
                const file = value[0];
                const uploadResponse = await ut.uploadFiles([file]);
                const fileData = uploadResponse[0]?.data;
                if (fileData) {
                    processedData[key] = {
                        url: fileData.url,
                        name: file.name,
                        size: file.size,
                        type: file.type
                    };
                }
            } catch (error) {
                console.error(`Error uploading file for field ${key}:`, error);
                processedData[key] = null;
            }
        } else {
            console.log('heyyy')
            processedData[key] = value;
        }
    }

    await db.update(complianceForms).set({
        submittedFormData: processedData,
        filledByComplianceOfficerAt: new Date().toISOString()
    }).where(eq(complianceForms.id, formId));

    return {
        message: "Form submitted successfully!!",
        data: processedData
    };
}