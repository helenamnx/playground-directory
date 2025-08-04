export const platformMock = {
  _id: 1,
  name: 'uoapp-backen',
  description: 'platform description',
  clients: [],
  services: [],
  domain: 'http://192.168.0.248:3002',
  configuration: {
    _id: 1,
    isActive: true,
    theme: 'dark',
    menuOptions: [
      {
        _id: 1,
        name: 'Send Notification',
        method: 'POST',
        endpoint: '/notification-send',
      },
      {
        _id: 3,
        name: 'Service Options',
        method: 'GET',
        endpoint: '/platforms-configuration',
      },
      {
        _id: 4,
        name: 'Update service options',
        method: 'POST',
        endpoint: '/platforms-configuration/update',
      },
    ],
  },
};
