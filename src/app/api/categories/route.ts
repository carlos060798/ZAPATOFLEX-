import { CatalogService } from '@/lib/services/catalog.service';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function GET() {
    try {
        const categories = await CatalogService.getCategories();
        return apiResponse(categories);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener categorías';
        return apiError(message);
    }
}
