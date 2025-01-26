import { LANDING_ROUTE } from "@/routes.config"
import { redirect } from "next/navigation"
import { getUserInServer } from "../utils/setAuthTokenAsCookie"
import { z } from "zod"
import { COUNTRIES } from "./countries"
export const addNewAccountFormSchema = z.object({
    donationLink: z.string().url({ message: "Please enter a valid URL" }),
    country: z.string({ required_error: "Please select a country" }).refine(data => COUNTRIES.some(country => country.value === data)),
    leaderboard: z.boolean(),
    accountId: z.string()
})

export type AddNewAccountFormData = z.infer<typeof addNewAccountFormSchema>
