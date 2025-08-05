import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentFolder } from '../document-folders/schemas/document-folder.schema';
import { PdfDocument } from '../pdf-documents/schemas/pdf-document.schema';

export interface SearchResult {
    folders: DocumentFolder[];
    documents: PdfDocument[];
    contentMatches: PdfDocument[];
}

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(DocumentFolder.name)
        private readonly documentFolderModel: Model<DocumentFolder>,
        @InjectModel(PdfDocument.name)
        private readonly pdfDocumentModel: Model<PdfDocument>,
    ) { }

    /**
     * Búsqueda completa en tres iteraciones:
     * 1. Carpetas que contengan la palabra
     * 2. Documentos que contengan la palabra en el nombre
     * 3. Documentos que contengan la palabra en el contenido
     */
    async searchAll(query: string): Promise<SearchResult> {
        const searchTerm = query.trim();

        if (!searchTerm) {
            return { folders: [], documents: [], contentMatches: [] };
        }

        // Crear expresión regular para búsqueda case-insensitive
        const regex = new RegExp(searchTerm, 'i');

        // Iteración 1: Buscar en nombres de carpetas
        const folders = await this.searchFolders(regex);

        // Iteración 2: Buscar en nombres de documentos
        const documents = await this.searchDocumentNames(regex);

        // Iteración 3: Buscar en contenido de documentos
        const contentMatches = await this.searchDocumentContent(regex);

        return {
            folders,
            documents,
            contentMatches
        };
    }

    /**
     * Iteración 1: Buscar carpetas por nombre
     */
    async searchFolders(regex: RegExp): Promise<DocumentFolder[]> {
        return this.documentFolderModel
            .find({ name: { $regex: regex } })
            .populate('parent', 'name')
            .sort({ name: 1 })
            .exec();
    }

    /**
     * Iteración 2: Buscar documentos por nombre
     */
    async searchDocumentNames(regex: RegExp): Promise<PdfDocument[]> {
        return this.pdfDocumentModel
            .find({ name: { $regex: regex } })
            .populate('parentFolder', 'name')
            .populate('creator', 'username email')
            .sort({ name: 1 })
            .exec();
    }

    /**
     * Iteración 3: Buscar en contenido de documentos
     */
    async searchDocumentContent(regex: RegExp): Promise<PdfDocument[]> {
        return this.pdfDocumentModel
            .find({
                indexedContent: { $regex: regex },
                // Excluir documentos que ya aparecieron en la búsqueda por nombre
                name: { $not: regex }
            })
            .populate('parentFolder', 'name')
            .populate('creator', 'username email')
            .sort({ name: 1 })
            .exec();
    }

    /**
     * Búsqueda específica por iteración
     */
    async searchByIteration(query: string, iteration: 1 | 2 | 3): Promise<DocumentFolder[] | PdfDocument[]> {
        const searchTerm = query.trim();

        if (!searchTerm) {
            return [];
        }

        const regex = new RegExp(searchTerm, 'i');

        switch (iteration) {
            case 1:
                return this.searchFolders(regex);
            case 2:
                return this.searchDocumentNames(regex);
            case 3:
                return this.searchDocumentContent(regex);
            default:
                return [];
        }
    }
}