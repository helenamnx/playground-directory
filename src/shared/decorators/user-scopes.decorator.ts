import { SetMetadata } from '@nestjs/common';

// export const USER_SCOPE_KEY = "user_client_scope";
// export const UserScopes = (...user_client_scope: string[]) =>
//   SetMetadata(USER_SCOPE_KEY, user_client_scope);

export const Resource = (resource: string) => SetMetadata('resource', resource);
export const UserScopes = (scope: string) => SetMetadata('scope', scope);
export const Roles = (roles: string[]) => SetMetadata('roles', roles);
