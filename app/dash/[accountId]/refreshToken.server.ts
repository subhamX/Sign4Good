import { Buffer } from "buffer";

const DOCUSIGN_AUTH_URL = "https://account-d.docusign.com/oauth/token";
const clientId = process.env.DOCUSIGN_CLIENT_ID;
const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        // Encode clientId and clientSecret in Base64
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

        // Make the API request
        const response = await fetch(DOCUSIGN_AUTH_URL, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
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

        console.log("New Access Token:", data.access_token);
        return data.access_token;
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}
