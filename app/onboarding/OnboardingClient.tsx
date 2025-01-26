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


export default function OnboardingClient({
    notConnectedAccounts,
    handleAddNewAccount,
}: {
    notConnectedAccounts: DocusignUserInfoResponseUser['accounts'],
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
        <div className="min-h-screen space-y-16 py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/80">
            {/* Available Accounts Section */}
            <section className="container mx-auto">
                <div className="space-y-6 text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                        Connect New Accounts
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Connect your DocuSign accounts and empower your NGO's digital presence
                    </p>
                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/20 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {notConnectedAccounts.map((account) => (
                        <Card key={account.account_id} className="backdrop-blur-sm bg-card/50 border-primary/10 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/80">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold line-clamp-1">
                                        {account.account_name}
                                    </CardTitle>
                                    <div className="flex items-center text-muted-foreground">
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/30 border border-primary/5">
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
                                    <form className="space-y-5" onSubmit={form.handleSubmit((data) => onSubmit({ ...data, accountId: account.account_id }))}>
                                        <FormField
                                            control={form.control}
                                            name="donationLink"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Donation Link</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://..."
                                                            type="url"
                                                            className="bg-background/50 border-primary/10 focus:border-primary/30"
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
                                                    <FormLabel>Country</FormLabel>
                                                    <Select
                                                        required
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-primary/10 focus:border-primary/30">
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
                                                    <FormLabel>Show on Leaderboard</FormLabel>
                                                    <Select
                                                        required
                                                        onValueChange={(value) => field.onChange(value === "yes")}
                                                        defaultValue={field.value ? "yes" : "no"}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background/50 border-primary/10 focus:border-primary/30">
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
                                            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground"
                                            disabled={submitting === account.account_id}
                                        >
                                            {submitting === account.account_id ? "Connecting..." : "Connect Account"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {notConnectedAccounts.length === 0 && (
                    <div className="text-center py-16 px-4 rounded-lg border border-primary/10 bg-card/50 backdrop-blur-sm max-w-2xl mx-auto">
                        <div className="mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
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
                            <Button className="bg-primary/90 hover:bg-primary text-primary-foreground px-8 py-6 h-auto text-lg font-medium">
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}

                {notConnectedAccounts.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Link href={DASH_ROUTE}>
                            <Button variant="outline" className="px-8 py-6 h-auto text-lg font-medium border-primary/20 hover:bg-primary/5">
                                Skip for now
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}