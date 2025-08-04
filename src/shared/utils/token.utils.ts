import * as JWT from 'jose';
import { UnauthorizedCustomResponse } from '../responses/error/custom-error-response';
import { CustomErrorKeys } from '../enums/error-keys.enum';

export function isTokenExpired(decodedToken: any) {
  if (decodedToken?.exp && Date.now() / 1000 > decodedToken.exp) return true;
  return false;
}

/**
 
@author Joel
@date 2024/07/08
@description Token decoder.
@tutorial https://github.com/panva/jose
@usage import * as jose from 'jose'
*/

export function decodeToken(userToken: string): any {
  return JWT.decodeJwt(userToken);
}

// /**
//  * @description Decodes and validates a token, checking for a specific field and expiration date.
//  * @author Helena Rodríguez
//  * @date 16/07/2024
//  * @export
//  * @param {string} token
//  * @returns {*}
//  */
// export function decodeAndValidateToken(token: string): UserToken {
//   //decode and verify the token
//   const decodedToken = decodeToken(token);
//   // Verificar el campo específico en el payload del token
//   validateClientId(decodedToken);

//   // Verificar la expiración del token
//   validateTokenExpiration(decodedToken);

//   return decodedToken;
// }

// /**
//  * @description Verifies that the token contains a specific field in its payload. Throws an error if the field is not present.
//  * @author Helena Rodríguez
//  * @date 16/07/2024
//  * @param {JWT.JWTPayload} decodedToken
//  */
// function validateClientId(decodedToken: UserToken) {
//   const clientId = decodedToken.client_id;

//   if (!clientId) {
//     throw new UnauthorizedCustomResponse({
//       title: "Invalid token",
//       detail: "The token does not contain the required field",
//       key: CustomErrorKeys.UNAUTHORIZED,
//     });
//   }
// }

// /**
//  * @description Verifies that the token has not expired. Throws an error if the token has expired. The expiration date is in the exp field of the token payload. The expiration date is in seconds since the Unix epoch. The current time is obtained with Date.now() and converted to seconds by dividing by 1000. The current time is compared with the expiration date to determine if the token has expired. If the exp field is not present, the token is considered valid. If the exp field is present and the expiration date is less than the current time, the token is considered expired. The exp field is optional in the JWT specification, so it is not always present in the token payload. If the exp field is not present, the token is considered valid. If the exp field is present and the expiration date is less than the current time, the token is considered expired. The exp field is optional in the JWT specification, so it is not always present in the token payload.
//  * @author Helena Rodríguez
//  * @date 16/07/2024
//  * @param {JWT.JWTPayload} decodedToken
//  */
// function validateTokenExpiration(decodedToken: JWT.JWTPayload) {
//   const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
//   if (decodedToken.exp && decodedToken.exp < now) {
//     throw new UnauthorizedCustomResponse({
//       title: "Token expired",
//       detail: "The token has expired",
//       key: CustomErrorKeys.UNAUTHORIZED,
//     });
//   }
// }

//This function is used to compare the required scopes of a controller vs the user-scopes
export function hasRequiredScopes(params: {
  requiredScopes: string[];
  actualScopes: string[];
}) {
  {
    const { requiredScopes, actualScopes } = params;
    return requiredScopes.some((attribute) =>
      actualScopes?.includes(attribute),
    );
  }
}

export function getTokenFromBearer(bearerString: string | undefined) {
  if (
    bearerString &&
    typeof bearerString === 'string' &&
    bearerString.startsWith('Bearer ')
  ) {
    // Verifica si la cadena empieza con 'Bearer '
    // Retorna el token eliminando 'Bearer ' del inicio
    return bearerString.slice(7); // 7 es la longitud de la palabra 'Bearer ' con el espacio
  } else {
    throw new UnauthorizedCustomResponse({
      title: 'Invalid token format',
      detail: "The token must be in the format 'Bearer [token_value]'",
      key: CustomErrorKeys.INVALID_TOKEN_FORMAT,
    });
  }
}
