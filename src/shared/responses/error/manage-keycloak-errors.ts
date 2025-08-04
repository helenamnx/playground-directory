import { CustomErrorKeys } from 'src/shared/enums/error-keys.enum';
import {
  ConflictCustomResponse,
  UnauthorizedCustomResponse,
} from './custom-error-response';

export function manageKeyCloakErrors(error: any) {
  if (isKeyCloakError(error)) {
    let errorMessage = error.response.data.errorMessage;
    let errorStatusText = error.response.statusText;
    let errorDescription = error.response.data.error_description;
    switch (error.response.status) {
      //TODO: usar diccionario o record
      case 409:
        throw new ConflictCustomResponse({
          title: errorStatusText,
          detail: errorMessage
            ? errorMessage
            : errorDescription
              ? errorDescription
              : 'Some error without description ocurred',
          key: CustomErrorKeys.KEYCLOAK_ERROR, //TODO: comprobar como hacer las keys para lOS errores de KeylCloak
        });

      case 401:
        throw new UnauthorizedCustomResponse({
          title: errorStatusText,
          detail: errorMessage
            ? errorMessage
            : errorDescription
              ? errorDescription
              : 'Some error without description ocurred',
          key: CustomErrorKeys.KEYCLOAK_ERROR, //TODO: comprobar como hacer las keys para los errores de KeylCloak
        });
      default:
        //si hay un error no controlado, enviar email al admin, hacer log del error
        throw new Error('Unhandled KeylCloak Error');
    }
    //TODO: si el error es porque el token está expirado, generar nuevo token y repetir llamada
  }
}
export function isKeyCloakError(error: unknown): error is KeyCloakError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    'data' in (error as any).response &&
    typeof (error as any).response.data === 'object'
    // &&
    // "error" in (error as any).response.data &&
    // "error_description" in (error as any).response.data
  );
}

interface KeyCloakError {
  response: {
    status: number;
    statusText: string;
    data: {
      error: string;
      error_description?: string;
      errorMessage?: string;
    };
  };
}
