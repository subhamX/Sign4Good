'use client'
import { getLoginUrl } from "@/app/getAuthUrl";
import { RainbowButton } from "./ui/rainbow-button";
import { Button } from "./ui/button";
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

