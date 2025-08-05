import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, SearchResult } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    /**
     * Endpoint para búsqueda completa (todas las iteraciones)
     * GET /search?q=palabra
     */
    @Get()
    async searchAll(@Query('q') query: string): Promise<SearchResult> {
        return this.searchService.searchAll(query);
    }

    /**
     * Endpoint para búsqueda por iteración específica
     * GET /search/iteration?q=palabra&iteration=1
     */
    @Get('iteration')
    async searchByIteration(
        @Query('q') query: string,
        @Query('iteration') iteration: string
    ) {
        const iterationNumber = parseInt(iteration) as 1 | 2 | 3;

        if (![1, 2, 3].includes(iterationNumber)) {
            throw new Error('La iteración debe ser 1, 2 o 3');
        }

        return this.searchService.searchByIteration(query, iterationNumber);
    }

    /**
     * Endpoint específico para buscar solo carpetas (Iteración 1)
     * GET /search/folders?q=palabra
     */
    @Get('folders')
    async searchFolders(@Query('q') query: string) {
        return this.searchService.searchByIteration(query, 1);
    }

    /**
     * Endpoint específico para buscar nombres de documentos (Iteración 2)
     * GET /search/documents?q=palabra
     */
    @Get('documents')
    async searchDocuments(@Query('q') query: string) {
        return this.searchService.searchByIteration(query, 2);
    }

    /**
     * Endpoint específico para buscar en contenido de documentos (Iteración 3)
     * GET /search/content?q=palabra
     */
    @Get('content')
    async searchContent(@Query('q') query: string) {
        return this.searchService.searchByIteration(query, 3);
    }
}