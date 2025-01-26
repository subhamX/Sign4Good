'use server';

import { AUTH_COOKIE_NAME } from "@/app/utils/setAuthTokenAsCookie";
import { LANDING_ROUTE } from "@/routes.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const onLogout = async () => {
    (await cookies()).delete(AUTH_COOKIE_NAME)
    return redirect(LANDING_ROUTE)
}