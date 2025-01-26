

export const ONBOARD_ROUTE = "/onboarding"

export const LANDING_ROUTE = "/"

export const DASH_ROUTE = "/dash"

export const DASH_ACCOUNT_ROUTE = (accountId: string) => `/dash/${accountId}`

export const DASH_ACCOUNT_IMPORT_ROUTE = (accountId: string) => `${DASH_ACCOUNT_ROUTE(accountId)}/import`
