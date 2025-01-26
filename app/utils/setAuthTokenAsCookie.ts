import { NextResponse } from "next/server";
import { SignJWT, base64url, decodeJwt, jwtVerify } from 'jose';
import { users } from "@/drizzle/schema";
import { cookies } from "next/headers"



const jwtToken = process.env.JSON_WEB_TOKEN_SECRET

if (!jwtToken) {
    throw new Error("JSON_WEB_TOKEN_SECRET not found in env")
}


export const AUTH_COOKIE_NAME = "mindxxxfulrecapsung"


export type jwtUserPayloadType = {
    email: string;
    name: string;
    docusignId: string;
};

/**
 * Utility function to set auth token
 */
export const setAuthTokenAsCookie = async (res: NextResponse, user: typeof users.$inferSelect) => {
    // create auth token
    const jwtPayload: jwtUserPayloadType = {
        email: user.email,
        name: user.name,
        docusignId: user.docusignId,
    };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 48 * 15; // 30 days

    const token = await new SignJWT(jwtPayload).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        // .setNotBefore(iat)
        .sign(new TextEncoder().encode(jwtToken));


    const useSecureUrl = !!process.env.VERCEL_URL
    res.cookies.set(AUTH_COOKIE_NAME, token, {
        secure: useSecureUrl,
        sameSite: "lax",
        httpOnly: true,
        maxAge: 7 * 24 * 3600000, // 7 days
    });

    return res;
};


export const getJwtPayloadFromCookie = async (cookie: string | undefined) => {
    try {
        const tttx = new TextEncoder().encode(jwtToken)
        const decoded = await jwtVerify(cookie as string, tttx);
        return decoded.payload as jwtUserPayloadType
    } catch (err) {
        // console.error('eeeee:', err)
        return null
    }
}


export const getUserInServer = async (): Promise<jwtUserPayloadType | null> => {
    try {
        const myCookie = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
        return await getJwtPayloadFromCookie(myCookie);
    } catch (err) {
        console.error(err);
        return null;
    }
}
