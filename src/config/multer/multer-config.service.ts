import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Servicio de configuración para Multer
 * 
 * Este servicio se encarga de configurar las opciones para la subida de archivos
 * usando Multer. Define dónde se guardan los archivos, cómo se nombran, 
 * qué tipos de archivo se permiten y el tamaño máximo.
 */
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    private readonly multerOptions: any;

    constructor(private readonly configService: ConfigService) {
        // Cargamos la configuración de multer desde las variables de entorno
        this.multerOptions = this.configService.get('multer', {});
    }

    /**
     * Crea y retorna las opciones de configuración para Multer
     * 
     * @returns MulterModuleOptions - Configuración completa para multer
     */
    createMulterOptions(): MulterModuleOptions {
        const { UPLOAD_DESTINATION, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } = this.multerOptions;

        return {
            // Configuración del almacenamiento en disco
            storage: diskStorage({
                // Carpeta donde se guardan los archivos subidos
                destination: UPLOAD_DESTINATION,
                
                // Función para generar el nombre del archivo manteniendo el original
                filename: (req, file, callback) => {
                    // Obtenemos el nombre original sin la extensión
                    const originalName = file.originalname;
                    const extension = extname(originalName);
                    const nameWithoutExtension = originalName.replace(extension, '');
                    
                    // Creamos una fecha legible en formato YYYY-MM-DD_HH-mm-ss
                    const now = new Date();
                    const dateString = now.toISOString()
                        .slice(0, 19) // Toma solo YYYY-MM-DDTHH:mm:ss
                        .replace('T', '_') // Reemplaza T con _
                        .replace(/:/g, '-'); // Reemplaza : con - para evitar problemas en nombres de archivo
                    
                    // Añadimos un número aleatorio pequeño para evitar conflictos si se suben archivos en el mismo segundo
                    const randomSuffix = Math.round(Math.random() * 999);
                    
                    // El archivo final será algo como: "Diploma Personal de oficinas (TP)_Helena_2025-08-06_12-30-45-123.pdf"
                    callback(null, `${nameWithoutExtension}_${dateString}-${randomSuffix}${extension}`);
                },
            }),

            // Filtro para validar qué tipos de archivo se permiten subir
            fileFilter: (req, file, callback) => {
                // Verificamos si el tipo MIME del archivo está en la lista permitida
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    callback(null, true); // Archivo permitido
                } else {
                    // Archivo no permitido - enviamos error descriptivo
                    callback(new Error(`File type not allowed. Only: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
                }
            },

            // Límites para la subida de archivos
            limits: {
                fileSize: MAX_FILE_SIZE, // Tamaño máximo del archivo en bytes
            },
        };
    }
}