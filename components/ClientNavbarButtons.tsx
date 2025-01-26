'use client'
import { getLoginUrl } from "@/app/getAuthUrl";
import { RainbowButton } from "./ui/rainbow-button";
import { Button } from "./ui/button";
import { onLogout } from "./navbar.server";
import { LogOut } from "lucide-react";


export const LogoutButton = () => {
  return (
    <Button onClick={onLogout} variant="ghost" className="text-sm hover:bg-red-500 hover:text-white bg-black text-white transition-colors duration-300">
      Logout 
      <LogOut className="w-4 h-4 ml-2" />
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

