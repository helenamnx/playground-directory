//Do not use on production environment. This mock is only used for testing purposes. The frontend client must be assigned
//via fivolution-manager
export const clientFrontendMock = {
  name: 'uoapp',
  alias: 'uoapp',
  description: "frontend client of the Guardia Civil Officers' Union",
  tenant: 'MNX-Online',
  technology: 'frontend',
  externalIds: [
    { kcID:  process.env.FRONTEND_CLIENT_KEYCLOAK_ID },
  ],
  email: process.env.FRONTEND_CLIENT_EMAIL,
  baseURL: process.env.FRONTEND_CLIENT_BASE_URL,
  configuration: {
    isActive: true,
    theme: 'light',
    defaultNotificationLanguage: 'en',
    maxSends: 5,
    supportedLanguages: ['en', 'es'],
    forgotUrl: process.env.FRONTEND_CLIENT_FORGOT_URL,
  },
};
