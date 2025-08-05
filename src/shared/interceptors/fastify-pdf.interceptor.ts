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
import { diskStorage } from 'multer';
import { extname } from 'path';

type MulterInstance = any;

export function FastifyPdfInterceptor(
    fieldName: string,
    localOptions?: Options,
): Type<NestInterceptor> {
    class MixinInterceptor implements NestInterceptor {
        protected multer: MulterInstance;

        constructor(
            @Optional()
            @Inject('MULTER_MODULE_OPTIONS')
            options: Multer,
        ) {
            // Configuración específica para archivos PDF
            const multerOptions: Options = {
                ...options,
                ...localOptions,
                storage: diskStorage({
                    destination: './uploads/pdfs',
                    filename: (req, file, callback) => {
                        const name = file.originalname.split('.')[0];
                        const fileExtName = extname(file.originalname);
                        const randomName = Array(8)
                            .fill(null)
                            .map(() => Math.round(Math.random() * 16).toString(16))
                            .join('');
                        callback(null, `${name}-${randomName}${fileExtName}`);
                    },
                }),
                fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
                    // Solo permitir archivos PDF
                    const allowedMimeTypes = ['application/pdf'];
                    if (!allowedMimeTypes.includes(file.mimetype)) {
                        return cb(
                            new Error('Solo se permiten archivos PDF'),
                            false,
                        );
                    }
                    cb(null, true);
                },
            };

            this.multer = (FastifyMulter as any)(multerOptions);
        }

        async intercept(
            context: ExecutionContext,
            next: CallHandler,
        ): Promise<Observable<any>> {
            const ctx = context.switchToHttp();

            await new Promise<void>((resolve, reject) => {
                this.multer.single(fieldName)(
                    ctx.getRequest(),
                    ctx.getResponse(),
                    (error: any) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve();
                    },
                );
            });

            return next.handle();
        }
    }
    const Interceptor = mixin(MixinInterceptor);
    return Interceptor as Type<NestInterceptor>;
}