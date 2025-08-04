import { ConfigModuleOptions } from '@nestjs/config';
export const validationOptions: ConfigModuleOptions['validationSchema'] = {
  allowUnknown: true,
  abortEarly: true,
};
