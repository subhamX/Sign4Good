import { db } from "@/drizzle/db-config";
import { users } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { setAuthTokenAsCookie } from "@/app/utils/setAuthTokenAsCookie";
import { getUserAndAccountInfo } from "@/app/utils/getUserAndAccountInfo";


type DocusignTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
} | {
  error: string;
  error_description: string;
}




export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }


  // const [header, payload, signature] = code.split(".");


  const response = await fetch(`https://account-d.docusign.com/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(
        `${process.env.INTEGRATION_KEY}:${process.env.DOCUSIGN_SECRET_KEY}`
      )}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
    }),
  });

  const data: DocusignTokenResponse = await response.json();

  if ('error' in data) {
    return NextResponse.json({ error: data.error_description }, { status: 400 });
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;

  const userInfo = await getUserAndAccountInfo(accessToken);

  if ('error' in userInfo) {
    return NextResponse.json({ error: userInfo.error_description }, { status: 400 });
  }

  const { sub, email, email_verified, name, given_name, family_name } = userInfo;

  let user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user.length === 0) {
    user = await db.insert(users).values({
      docusignId: sub,
      email,
      name,
      accessToken,
      refreshToken,
    }).returning();
  } else {
    // update it
    user = await db.update(users).set({
      accessToken,
      refreshToken,
    }).where(eq(users.docusignId, sub)).returning();
  }

  const baseUrl = new URL(req.url);
  baseUrl.pathname = '/dash';


  const res = NextResponse.redirect(baseUrl);

  return await setAuthTokenAsCookie(res, user[0]);
}


