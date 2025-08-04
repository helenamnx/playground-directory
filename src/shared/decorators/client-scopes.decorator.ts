import { SetMetadata } from "@nestjs/common";

export const CLIENT_SCOPE_KEY = "client_scope";
export const ClientScopes = (...client_scope: string[]) =>
  SetMetadata(CLIENT_SCOPE_KEY, client_scope);
