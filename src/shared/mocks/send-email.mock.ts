export const sendEmailMock = {
  emailType: 'forgot-password',
  headers: {
    sender: {
      email: 'paladea@email.com',
      senderId: 2123,
      senderType: 'AppUser',
    },
    subject: 'Hello world',
    recipients: [
      {
        email: 'helena@mnxonline.com',
        toRecipientId: 2123,
        toRecipientType: 'AppUser',
        variables: {
          version: 'test version',
          headerText: 'Helena',
          bodyText: 'variable de ejemplo body',
          varText: 'variable de ejemplo text',
          footerMSG: 'variable de ejemplo del footer',
        },
      },
    ],
    ccRecipients: [],
    bccRecipients: [],
    language: 'es',
  },
  subject: 'Hello world',
  language: 'es',
};
