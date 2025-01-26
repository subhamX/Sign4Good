import { db } from "@/drizzle/db-config";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export type DocusignUserInfoResponseUser = {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    given_name: string;
    family_name: string;
    accounts: {
      account_id: string;
      account_name: string;
      base_uri: string;
      email: string;
    }[];
}


export type DocusignUserInfoResponse = DocusignUserInfoResponseUser | {
  error: string;
  error_description: string;
}


export const getUserAndAccountInfo = async (accessToken: string) => {
    // get user info
    const userInfoResponse = await fetch(`https://account-d.docusign.com/oauth/userinfo`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const userInfo: DocusignUserInfoResponse = await userInfoResponse.json();

    return userInfo
}