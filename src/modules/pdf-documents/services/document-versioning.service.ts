import { Injectable } from '@nestjs/common';
import { DocumentVersionsService } from '../../document-versions/document-versions.service';

/**
 * Servicio para manejar el versionado automático de documentos
 * 
 * Este servicio se encarga de generar automáticamente los nombres de versión
 * en formato v.X.Y.Z basándose en archivos con el mismo nombre.
 */
@Injectable()
export class DocumentVersioningService {
    constructor(
        private readonly documentVersionsService: DocumentVersionsService,
    ) { }

    /**
     * Genera el siguiente nombre de versión automáticamente
     * Busca documentos con el mismo nombre para determinar la siguiente versión
     * 
     * @param documentName - Nombre del documento para buscar duplicados
     * @returns Promise<string> - Próximo nombre de versión (ej: "v0.0.0", "v0.0.1")
     */
    async generateNextVersionName(documentName: string): Promise<string> {
        try {
            // Buscar todas las versiones de documentos con el mismo nombre
            // Esto requiere implementar una búsqueda más compleja que cruce con PdfDocument

            // Por ahora, implementamos la lógica básica:
            // TODO: Implementar búsqueda cross-collection para encontrar documentos con mismo nombre

            // Temporal: buscar todas las versiones existentes para generar siguiente número
            const allVersions = await this.documentVersionsService.findAll({});

            if (!allVersions || allVersions.length === 0) {
                // Primera versión en el sistema
                return 'v0.0.0';
            }

            // Extraer números de versión válidos
            const versionNumbers = allVersions
                .map(version => this.parseVersionNumber(version.name))
                .filter(versionNumber => versionNumber !== null)
                .sort((a, b) => this.compareVersions(a, b));

            if (versionNumbers.length === 0) {
                // No hay versiones válidas, empezar desde v0.0.0
                return 'v0.0.0';
            }

            // Obtener la última versión e incrementar patch
            const lastVersion = versionNumbers[versionNumbers.length - 1];
            const nextVersion = this.incrementPatchVersion(lastVersion);

            return this.formatVersionNumber(nextVersion);
        } catch (error) {
            console.error('Error generando nombre de versión:', error);
            // Fallback a versión inicial si hay error
            return 'v0.0.0';
        }
    }

    /**
     * Parsea un nombre de versión a números
     * 
     * @param versionName - Nombre de versión (ej: "v0.0.1")
     * @returns {major: number, minor: number, patch: number} | null
     */
    private parseVersionNumber(versionName: string): { major: number, minor: number, patch: number } | null {
        if (!versionName || typeof versionName !== 'string') {
            return null;
        }

        const versionRegex = /^v(\d+)\.(\d+)\.(\d+)$/;
        const match = versionName.match(versionRegex);

        if (!match) {
            return null;
        }

        return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
        };
    }

    /**
     * Compara dos versiones para ordenamiento
     */
    private compareVersions(
        a: { major: number, minor: number, patch: number },
        b: { major: number, minor: number, patch: number }
    ): number {
        if (a.major !== b.major) return a.major - b.major;
        if (a.minor !== b.minor) return a.minor - b.minor;
        return a.patch - b.patch;
    }

    /**
     * Incrementa la versión patch (último número)
     */
    private incrementPatchVersion(
        version: { major: number, minor: number, patch: number }
    ): { major: number, minor: number, patch: number } {
        return {
            major: version.major,
            minor: version.minor,
            patch: version.patch + 1,
        };
    }

    /**
     * Formatea números de versión a string
     */
    private formatVersionNumber(version: { major: number, minor: number, patch: number }): string {
        return `v${version.major}.${version.minor}.${version.patch}`;
    }

    // TODO: Implementar búsqueda cross-collection para detectar documentos con mismo nombre
    // TODO: Implementar lógica para diferentes tipos de versión:
    // TODO: - Borrador: incrementa patch (v0.0.1 -> v0.0.2)
    // TODO: - Actualización: incrementa minor (v0.0.1 -> v0.1.0)
    // TODO: - Publicación: incrementa major (v0.1.0 -> v1.0.0)
    // TODO: Añadir parámetro versionType: 'draft' | 'update' | 'release'
}