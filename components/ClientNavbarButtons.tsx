'use client'
import { getLoginUrl } from "@/app/getAuthUrl";
import { RainbowButton } from "./ui/rainbow-button";
import { LANDING_ROUTE } from "@/routes.config";
import { Button } from "./ui/button";
import { AUTH_COOKIE_NAME } from "@/app/utils/setAuthTokenAsCookie";
import { onLogout } from "./navbar.server";


export const LogoutButton = () => {
  return (
    <Button onClick={onLogout} variant="ghost" className="text-sm">
      Logout
    </Button>
  )
}

export const LoginButton = () => {
  return (
    <RainbowButton
      onClick={async () => {
        const url = await getLoginUrl();
        window.location.href = url;
      }}
    >
      Login with DocuSign
    </RainbowButton>
  )
}

