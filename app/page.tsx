'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getLoginUrl } from "./getAuthUrl";
import { RainbowButton } from "@/components/ui/rainbow-button";




export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Hello World</h1>


      <RainbowButton onClick={async () => {
        const url = await getLoginUrl();
        window.location.href = url;
      }}>
        Connect Docusign
      </RainbowButton>

    </div>
  );
}
