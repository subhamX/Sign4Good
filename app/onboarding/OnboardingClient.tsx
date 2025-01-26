'use client'

import { DASH_ROUTE } from "@/routes.config"
import { DocusignUserInfoResponseUser } from "../utils/getUserAndAccountInfo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { COUNTRIES } from "./countries"
import { AddNewAccountFormData, addNewAccountFormSchema } from "./typesX"
import { useToast } from "@/hooks/use-toast"
import { accounts } from "@/drizzle/schema"
import { usersToAccountsBridgeTable } from "@/drizzle/schema"


export default function OnboardingClient({
    notConnectedAccountsAndNotOnPlatform,
    accountsAlreadyOnPlatformButNotConnectedWithThisUser,
    handleAddNewAccount,
}: {
    notConnectedAccountsAndNotOnPlatform: DocusignUserInfoResponseUser['accounts'],
    accountsAlreadyOnPlatformButNotConnectedWithThisUser: (typeof accounts.$inferSelect)[],
    handleAddNewAccount: (data: AddNewAccountFormData) => Promise<{ error?: string, message?: string }>,
}) {
    const [submitting, setSubmitting] = useState<string | null>(null)
    const { toast } = useToast()

    const form = useForm<AddNewAccountFormData>({
        resolver: zodResolver(addNewAccountFormSchema),
        defaultValues: {
            donationLink: "",
            country: "",
            leaderboard: false,
            accountId: ""
        }
    })

    const onSubmit = async (data: AddNewAccountFormData) => {
        try {
            setSubmitting(data.accountId)
            console.log("Form submitted:", data)
            const response = await handleAddNewAccount(data)

            if('error' in response){
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: response.error
                })
            }else{
                toast({
                    title: "Success",
                    description: response.message
                })
            }

        } catch (error: unknown) {
            console.error("Submission error:", error)

            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            })
        } finally {
            setSubmitting(null)
        }
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background/90">
            <section className="container mx-auto">
                <div className="space-y-6 text-center max-w-3xl mx-auto mb-16  translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
                    <div className="relative">
                        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 -z-10" />
                        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                            Connect New Accounts
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground/90">
                        Connect your DocuSign accounts and empower your NGO's digital presence
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-primary via-primary/50 to-transparent mx-auto rounded-full" />
                </div>

                {accountsAlreadyOnPlatformButNotConnectedWithThisUser.length > 0 && (
                    <div className="mb-16  translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-forwards">
                        <h2 className="text-2xl font-semibold mb-8 text-center">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
                                Existing Platform Accounts
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {accountsAlreadyOnPlatformButNotConnectedWithThisUser.map((account, index) => (
                                <div
                                    key={account.docuSignAccountId}
                                    className=" translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Card className="group backdrop-blur-sm bg-orange-500/[0.02] border-orange-500/20 transition-all duration-500 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-orange-500 transition-colors duration-300">
                                                    {account.docuSignAccountName}
                                                </CardTitle>
                                                <div className="flex items-center text-muted-foreground">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                                                        <span className="text-sm font-medium text-orange-500">On Platform</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardDescription className="line-clamp-1 text-muted-foreground/80">
                                                {account.donationLink}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button 
                                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                                onClick={() => onSubmit({ accountId: account.docuSignAccountId, alreadyConnected: true })}
                                                disabled={submitting === account.docuSignAccountId}
                                            >
                                                {submitting === account.docuSignAccountId ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Connecting...
                                                    </div>
                                                ) : (
                                                    "Add to Your Accounts"
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className=" translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400 fill-mode-forwards">
                    <h2 className="text-2xl font-semibold mb-8 text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                            New Accounts to Connect
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {notConnectedAccountsAndNotOnPlatform.map((account, index) => (
                            <div
                                key={account.account_id}
                                className=" translate-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <Card className="group backdrop-blur-sm bg-card/50 border-primary/10 transition-all duration-500 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/80">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300">
                                                {account.account_name}
                                            </CardTitle>
                                            <div className="flex items-center text-muted-foreground">
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/30 border border-primary/5">
                                                    <X className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Not Connected</span>
                                                </div>
                                            </div>
                                        </div>
                                        <CardDescription className="line-clamp-1 text-muted-foreground/80">
                                            {account.base_uri}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <Form {...form}>
                                            <form className="space-y-6" onSubmit={form.handleSubmit((data) => onSubmit({ ...data, accountId: account.account_id }))}>
                                                <FormField
                                                    control={form.control}
                                                    name="donationLink"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-foreground/90">Donation Link</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="https://..."
                                                                    type="url"
                                                                    className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all duration-300"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="country"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-foreground/90">Country</FormLabel>
                                                            <Select
                                                                required
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all duration-300">
                                                                        <SelectValue placeholder="Select country" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {COUNTRIES.map((country) => (
                                                                        <SelectItem key={country.value} value={country.value}>
                                                                            {country.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="leaderboard"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-foreground/90">Show on Leaderboard</FormLabel>
                                                            <Select
                                                                required
                                                                onValueChange={(value) => field.onChange(value === "yes")}
                                                                defaultValue={field.value ? "yes" : "no"}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-background/50 border-primary/10 focus:border-primary/30 transition-all duration-300">
                                                                        <SelectValue placeholder="Select visibility" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="yes">Yes, show my NGO</SelectItem>
                                                                    <SelectItem value="no">No, keep private</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                                                    disabled={submitting === account.account_id}
                                                >
                                                    {submitting === account.account_id ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Connecting...
                                                        </div>
                                                    ) : (
                                                        "Connect Account"
                                                    )}
                                                </Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {notConnectedAccountsAndNotOnPlatform.length === 0 && (
                        <div className=" scale-95 animate-in fade-in zoom-in duration-500 fill-mode-forwards text-center py-16 px-4 rounded-lg border border-primary/10 bg-card/50 backdrop-blur-sm max-w-2xl mx-auto">
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <ArrowRight className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-semibold text-foreground mb-2">
                                    All Accounts Connected
                                </h3>
                                <p className="text-muted-foreground">
                                    You've successfully connected all your DocuSign accounts. Head to the dashboard to manage your documents.
                                </p>
                            </div>
                            <Link href={DASH_ROUTE} className="inline-block">
                                <Button className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground px-8 py-6 h-auto text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )}

                    {notConnectedAccountsAndNotOnPlatform.length > 0 && (
                        <div className=" translate-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-forwards flex justify-center mt-8">
                            <Link href={DASH_ROUTE}>
                                <Button 
                                    variant="outline" 
                                    className="group px-8 py-6 h-auto text-lg font-medium border-primary/20 hover:bg-primary/5 transition-all duration-300"
                                >
                                    Skip for now
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}