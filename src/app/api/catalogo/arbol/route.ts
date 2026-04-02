import { NextRequest } from 'next/server';
import { CatalogService } from '@/lib/services/catalog.service';
import { apiResponse, apiError } from '@/lib/api-helpers';

/**
 * Endpoint especializado para el informe "Navegando Mareas".
 * Utiliza formalmente el PatrÃ³n Composite para renderizar jerarquÃ­as de categorÃ­as.
 */
export async function GET(request: NextRequest) {
    try {
        const tree = await CatalogService.getCategoriesTree();
        return apiResponse(tree);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener el Ã¡rbol de categorÃ­as';
        return apiError(message);
    }
}
