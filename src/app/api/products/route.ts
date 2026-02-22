import { NextRequest } from 'next/server';
import { CatalogService } from '@/lib/services/catalog.service';
import { productQuerySchema, productCreateSchema } from '@/lib/validators';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const query = productQuerySchema.parse(searchParams);
        const result = await CatalogService.getProducts(query);
        return apiResponse(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener productos';
        return apiError(message);
    }
}

export async function POST(request: NextRequest) {
    try {
        requireAdmin(request);
        const body = await request.json();
        const data = productCreateSchema.parse(body);
        const producto = await CatalogService.createProduct(data);
        return apiResponse(producto, 201);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al crear producto';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}
