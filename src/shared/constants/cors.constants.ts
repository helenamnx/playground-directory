import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export const CORS: CorsOptions = {
  origin: true,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "client-id",
    "client-secret",
    "idempotence-key",
    "user-token",
    "client-token",
  ],
};
