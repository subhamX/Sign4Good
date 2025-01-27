import { db } from "@/drizzle/db-config";
import { users } from "@/drizzle/schema";
import { Buffer } from "buffer";
import { eq } from "drizzle-orm";

const DOCUSIGN_AUTH_URL = "https://account-d.docusign.com/oauth/token";
const clientId = process.env.INTEGRATION_KEY;
const clientSecret = process.env.DOCUSIGN_SECRET_KEY;

export async function refreshAccessToken(refreshToken: string, docusignId: string): Promise<string | null> {
    try {
        // Encode clientId and clientSecret in Base64
        // const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        // Make the API request
        const response = await fetch(DOCUSIGN_AUTH_URL, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error refreshing token:", data);
            return null;
        }

        // console.log("New Access Token:", data.access_token);

        await db.update(users).set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        }).where(eq(users.docusignId, docusignId));

        return data.access_token;
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}



const usersX = await db.select().from(users) 
for (const user of usersX) {
    const refreshToken = user.refreshToken;
    const accessToken = await refreshAccessToken(refreshToken, user.docusignId);
    console.log(accessToken);
}