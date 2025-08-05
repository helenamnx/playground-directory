export const corsConfig = {
  origin: process.env.CORS_ORIGIN,
  methods: 'GET, POST, PUT, DELETE, PATCH',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'idempotence-key',
    'user-token',
    'client-token',
    'client-id',
    'client-secret',
  ],
};
