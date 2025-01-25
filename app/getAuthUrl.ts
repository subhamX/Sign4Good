'use server'
const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
const redirectUrl = `${process.env.APP_BASE_URL}/auth/docusign-callback`;

export const getLoginUrl = async () => {
  const url = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature,user_read&client_id=${integrationKey}&redirect_uri=${redirectUrl}`
  return url;
};