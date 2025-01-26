import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db-config";
import { accounts, monitoredEnvelopes, users, usersToAccountsBridgeTable } from "@/drizzle/schema";

interface FormData {
    formInstanceName: string;
    formValues: {
        [key: string]: any;
    };
}

export const createWebform = async (envelopeId: string, userId: string) => {
    const envelope = await db.select().from(monitoredEnvelopes)
        .innerJoin(accounts, eq(accounts.docuSignAccountId, monitoredEnvelopes.accountId))
        .innerJoin(usersToAccountsBridgeTable, and(
            eq(usersToAccountsBridgeTable.accountId, accounts.docuSignAccountId)
        ))
        .innerJoin(users, eq(users.docusignId, usersToAccountsBridgeTable.userId))
        .where(
            and(
                eq(monitoredEnvelopes.envelopeId, envelopeId),
                eq(users.docusignId, userId)
            )
        );

    if (envelope.length !== 1) {
        throw new Error("Envelope not found");
    }

    const accountId = envelope[0].enterprise_info.docuSignAccountId;

    // Create a form template
    const createFormUri = `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/templates`;
    
    try {
        const createFormResponse = await fetch(createFormUri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${envelope[0].users.accessToken}`,
            },
            body: JSON.stringify({
                name: "Compliance Form Template",
                emailSubject: "Please complete this compliance verification form",
                description: "Form for compliance verification",
                documents: [{
                    documentId: "1",
                    name: "Compliance Check",
                    fileExtension: "html",
                    documentBase64: Buffer.from(`
                        <html>
                            <body>
                                <h1>Compliance Verification Form</h1>
                                <div>
                                    <label>Compliance Check:</label>
                                    <input type="checkbox" data-tab="check1" />
                                </div>
                                <div>
                                    <label>Comments:</label>
                                    <input type="text" data-tab="text1" />
                                </div>
                                <div>
                                    <label>Verification Date:</label>
                                    <input type="date" data-tab="date1" />
                                </div>
                            </body>
                        </html>
                    `).toString('base64')
                }],
                recipients: {
                    signers: [{
                        roleName: "Compliance Officer",
                        recipientId: "1",
                        routingOrder: "1",
                        tabs: {
                            checkboxTabs: [{
                                tabLabel: "check1",
                                documentId: "1",
                                pageNumber: "1",
                                xPosition: "200",
                                yPosition: "100"
                            }],
                            textTabs: [{
                                tabLabel: "text1",
                                documentId: "1",
                                pageNumber: "1",
                                xPosition: "200",
                                yPosition: "200"
                            }],
                            dateTabs: [{
                                tabLabel: "date1",
                                documentId: "1",
                                pageNumber: "1",
                                xPosition: "200",
                                yPosition: "300"
                            }]
                        }
                    }]
                },
                status: "created"
            }),
        });

        if (!createFormResponse.ok) {
            const errorText = await createFormResponse.text();
            console.error('Error creating template:', errorText);
            throw new Error(`HTTP error! status: ${createFormResponse.status}`);
        }

        const templateData = await createFormResponse.json();
        console.log('Template created:', templateData);

        const uri = `https://apps-d.docusign.com/api/webforms/v1.1/accounts/${accountId}/forms/a620665b-cc81-432c-9fd0-3cb48c3c7715/instances`;
        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${envelope[0].users.accessToken}`,
            },
            body: JSON.stringify({
                clientUserId: envelope[0].monitored_envelopes.complianceOfficerEmail,
                returnUrl: `${process.env.NEXT_PUBLIC_APP_LINK}/docusign-webform/callback`,
                formValues: {
                    "textField1": "Sample Text",
                    "booleanField1": true,
                    "multiSelect1": ["Option1", "Option2"],
                    "singleSelect1": "Option1",
                    "numberField1": 42
                },
            }),
        });


        console.log(response);

        const data = await response.json();
        console.log(data);

        // Create an envelope from the template
        // const createEnvelopeUri = `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes`;
        // const envelopeResponse = await fetch(createEnvelopeUri, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Accept: 'application/json',
        //         Authorization: `Bearer ${envelope[0].users.accessToken}`,
        //     },
        //     body: JSON.stringify({
        //         templateId: templateData.templateId,
        //         status: "sent",
        //         templateRoles: [{
        //             email: envelope[0].monitored_envelopes.complianceOfficerEmail,
        //             name: "Compliance Officer",
        //             roleName: "Compliance Officer",
        //             clientUserId: envelope[0].monitored_envelopes.complianceOfficerEmail
        //         }]
        //     }),
        // });

        // if (!envelopeResponse.ok) {
        //     const errorText = await envelopeResponse.text();
        //     console.error('Error creating envelope:', errorText);
        //     throw new Error(`HTTP error! status: ${envelopeResponse.status}`);
        // }

        // const envelopeData = await envelopeResponse.json();
        // console.log('Envelope created:', envelopeData);

        // // Get the recipient view URL
        // const viewUrl = `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeData.envelopeId}/views/recipient`;
        // const viewResponse = await fetch(viewUrl, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Accept: 'application/json',
        //         Authorization: `Bearer ${envelope[0].users.accessToken}`,
        //     },
        //     body: JSON.stringify({
        //         email: envelope[0].monitored_envelopes.complianceOfficerEmail,
        //         userName: "Compliance Officer",
        //         clientUserId: envelope[0].monitored_envelopes.complianceOfficerEmail,
        //         returnUrl: `${process.env.NEXT_PUBLIC_APP_LINK}/docusign-webform/callback`
        //     }),
        // });

        // if (!viewResponse.ok) {
        //     const errorText = await viewResponse.text();
        //     console.error('Error getting recipient view:', errorText);
        //     throw new Error(`HTTP error! status: ${viewResponse.status}`);
        // }

        // const viewData = await viewResponse.json();
        // console.log('View URL created:', viewData);
        // return viewData;
    } catch (error) {
        console.error('Error in form creation process:', error);
        throw error;
    }
}

createWebform("caadf98f-23dd-4e30-beef-7d12d5cc2b35", "e7dc44cd-8cff-4480-899c-3d7d292b543b");