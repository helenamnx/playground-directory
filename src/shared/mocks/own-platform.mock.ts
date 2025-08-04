export const ownPlatformMock = {
  name: 'uoapp-backend',
  alias: 'uoapp-backend',
  description: "Application for the management of users and exams of the Civil Guard Officers' Union.",
  tenant: 'MNXOnline',
  technology: 'Uoapp',
  externalIds: [{ kcID: process.env.CLIENT_KEYCLOAK_ID }],
  clients: [],
  services: [],
  baseURL: process.env.PLATFORM_BASE_URL,
  email: 'noreply@hazteunplan.com',
  configuration: {
    isActive: true,
    theme: 'light',
    menuOptions: [
      {
        name: 'Send Notification',
        method: 'POST',
        endpoint: '/notifications/send',
      },
      {
        name: 'Service Options',
        method: 'GET',
        endpoint: '/platforms-configuration',
      },
      {
        name: 'Update service options',
        method: 'POST',
        endpoint: '/platforms-configuration/update',
      },
    ],
  },
};
