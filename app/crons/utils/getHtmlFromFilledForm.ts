import { complianceForms } from "@/drizzle/schema";

export const getHtmlFromFilledForm = async (complianceForm: (typeof complianceForms.$inferSelect)) => {
    if (!complianceForm.submittedFormData) {
        throw new Error('Form data has not been submitted yet');
    }

    const formFields = complianceForm.generatedSchema;
    const submittedData = complianceForm.submittedFormData;

    const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Compliance Form Response</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: #f9fafb;
                }
                .form-container {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 2rem;
                }
                .form-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .form-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }
                .form-subtitle {
                    color: #6b7280;
                    margin-top: 0.5rem;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-label {
                    display: block;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .form-value {
                    padding: 0.75rem;
                    background: #f3f4f6;
                    border-radius: 6px;
                    color: #1f2937;
                }
                .form-description {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }
                .form-footer {
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .proof-link {
                    color: #2563eb;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .proof-link:hover {
                    text-decoration: underline;
                }
                .proof-section {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px dashed #e5e7eb;
                }
                .proof-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }
            </style>
        </head>
        <body>
            <div class="form-container">
                <div class="form-header">
                    <h1 class="form-title">Compliance Form Response</h1>
                    <p class="form-subtitle">Submitted on ${new Date(complianceForm.filledByComplianceOfficerAt || '').toLocaleDateString()}</p>
                </div>
                
                ${formFields.map(field => {
                    const value = submittedData[field.name];
                    const proofKey = field.name + '_proof';
                    const proofValue = submittedData[proofKey];
                    let displayValue = value;

                    // Handle different field types
                    if (field.type === 'single_select' || field.type === 'multi_select') {
                        displayValue = value || 'Not selected';
                    } else if (!value) {
                        displayValue = 'Not provided';
                    }

                    return `
                        <div class="form-group">
                            <label class="form-label">${field.label || field.name}</label>
                            <div class="form-value">${displayValue}</div>
                            ${field.description ? `<div class="form-description">${field.description}</div>` : ''}
                            ${proofValue && typeof proofValue === 'object' ? `
                                <div class="proof-section">
                                    <div class="proof-label">Proof Document:</div>
                                    <a href="${proofValue.url}" class="proof-link" target="_blank">
                                        📎 ${proofValue.name}
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}

                <div class="form-footer">
                    <p>Form ID: ${complianceForm.id}</p>
                    <p>Envelope ID: ${complianceForm.envelopeId}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return formHtml;
}