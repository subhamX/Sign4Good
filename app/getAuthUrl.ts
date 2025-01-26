'use server'
const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
const redirectUrl = `${process.env.APP_BASE_URL}/auth/docusign-callback`;

export const getLoginUrl = async () => {
  return `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20click.manage%20click.send%20webforms_read%20webforms_instance_read%20webforms_instance_write%20extended&client_id=${integrationKey}&redirect_uri=${redirectUrl}`;
  // 
    // signature%20click.manage%20click.send%20webforms_read%20webforms_instance_read%20webforms_instance_write%20extended
  const url = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20click.manage%20click.send%20webforms_read%20webforms_instance_read%20webforms_instance_write%20extended&client_id=${integrationKey}&redirect_uri=${redirectUrl}`
  return url;
};
