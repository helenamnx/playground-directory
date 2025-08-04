import {
  CallHandler,
  ExecutionContext,
  Inject,
  mixin,
  NestInterceptor,
  Optional,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import FastifyMulter from 'fastify-multer';
import { Options, Multer } from 'multer';

type MulterInstance = any;

export function FastifyFilesInterceptor(
  fields: { name: string; maxCount?: number }[], // Mantenerlo como una lista de objetos
  localOptions?: Options,
): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    protected multer: MulterInstance;

    constructor(
      @Optional()
      @Inject('MULTER_MODULE_OPTIONS')
      options: Multer,
    ) {
      // Definimos el filtro de archivos aquí
      const multerOptions: Options = {
        ...options,
        ...localOptions,
        fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
          // Comprobamos la extensión del archivo (solo PNG y JPG)
          const allowedMimeTypes = [
            'image/webp',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
          ];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new Error('Solo se permiten archivos PNG, JPG, WEBP o SVG'),
              false,
            );
          }
          cb(null, true); // Permite el archivo
        },
      };

      this.multer = (FastifyMulter as any)(multerOptions);
      // this.multer = (FastifyMulter as any)({ ...options, ...localOptions });
    }

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();

      const fieldsNames = fields.map((f) => f.name); // Extraer todos los nombres de los campos (images, logos, etc.)

      // Si no se define nada en 'fields', no hacemos nada y dejamos pasar el request sin error.
      if (!fieldsNames.length) {
        return next.handle();
      }

      await new Promise<void>((resolve, reject) => {
        // Usamos `multer.fields()` pero pasamos dinámicamente los nombres de los campos
        this.multer.fields(fields)(request, ctx.getResponse(), (error: any) => {
          if (error) {
            return reject(error); // Si hay error, lo rechazamos.
          }
          resolve();
        });
      });

      return next.handle(); // Continuamos con la ejecución de la request.
    }
  }

  return mixin(MixinInterceptor) as Type<NestInterceptor>;
}
