'use client'
import { getLoginUrl } from "./getAuthUrl";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-btn";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileCheck, DollarSign, Trophy, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mb-4 md:mb-6 px-4">
          Bringing <span className="text-primary">Transparency</span> to NGO Operations
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-6 md:mb-8 px-4">
          SignForGood helps NGOs manage funding, ensure compliance, and track impact through secure DocuSign workflows
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4">
          <InteractiveHoverButton
              onClick={async () => {
                const url = await getLoginUrl();
                window.location.href = url;
              }}
            />
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Funding Transparency</h3>
              <p className="text-sm md:text-base text-muted-foreground">Track and manage donations with conditions through secure DocuSign workflows</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Compliance Forms</h3>
              <p className="text-sm md:text-base text-muted-foreground">Collect and verify proof of impact with image attachments and signatures</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Secure Spending</h3>
              <p className="text-sm md:text-base text-muted-foreground">Document and approve all expenditures through standardized forms</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Impact Leaderboard</h3>
              <p className="text-sm md:text-base text-muted-foreground">Showcase your organization's impact and inspire others</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Make an Impact?</h2>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Join NGOs using SignForGood to bring transparency and trust to their operations
          </p>
            <Button onClick={async () => {
            const url = await getLoginUrl()
            window.location.href = url
          }}  size="lg" className="w-full sm:w-auto gap-2">
              Connect Your NGO
              <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </section>
    </div>
  )
}
