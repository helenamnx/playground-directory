/**
 * @description This interface represents the response of the create resource endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @interface CreateResourceResponse
 */
export interface CreateResourceResponse {
  name: string;
  owner: Owner;
  ownerManagedAccess: boolean;
  displayName: string;
  attributes: Attributes;
  _id: string;
  uris: string[];
  scopes: Scopes[];
}

/**
 * @description This interface represents the attributes response of the create resource endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @interface Attributes
 */
export interface Attributes {}

/**
 * @description This interface represents the owner response of the create resource endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @interface Owner
 */
export interface Owner {
  id: string;
  name: string;
}

/**
 * @description This interface represents the scopes response of the create resource endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @export
 * @interface Scopes
 */
export interface Scopes {
  id: string;
  name: string;
}

/**
 * @description This interface represents the response of the create policy endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @interface CreatePolicyResponse
 */
export interface CreatePolicyResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  logic: string;
  decisionStrategy: string;
  roles: Role[];
}

/**
 * @description This interface represents the role response of the create permission endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @interface Role
 */
export interface Role {
  id: string;
  required: boolean;
}

/**
 * @description This interface represents the response of the create permission endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @export
 * @interface CreatePermissionResponse
 */
export interface CreatePermissionResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  policies: string[];
  resources: string[];
  scopes: string[];
  logic: string;
  decisionStrategy: string;
  config: Config;
}

/**
 * @description This interface represents the config response of the create permission endpoint from Keycloak
 * @author Damian
 * @date 12/06/2025
 * @export
 * @interface Config
 */
export interface Config {}

/**
 * @description This interface represents the response of the client role endpoint from Keycloak
 * @author Damian
 * @date 13/06/2025
 * @export
 * @interface RoleResponse
 */
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
}

/**
 * @description This interface represents the response of the login endpoint from Keycloak
 * @author Damian
 * @date 13/06/2025
 * @export
 * @interface UserTokenResponse
 */
export interface UserTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

/**
 * @description This interface represents the response of the client token endpoint from Keycloak
 * @author Damian
 * @date 14/06/2025
 * @export
 * @interface ClientTokenResponse
 */
export interface ClientTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  scope: string;
}
