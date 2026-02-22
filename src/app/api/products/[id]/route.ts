import { NextRequest } from 'next/server';
import { CatalogService } from '@/lib/services/catalog.service';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-helpers';
import { productUpdateSchema } from '@/lib/validators';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const producto = await CatalogService.getProductById(Number(id));
        return apiResponse(producto);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Producto no encontrado';
        return apiError(message, 404);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        const { id } = await params;
        const body = await request.json();
        const data = productUpdateSchema.parse(body);
        const producto = await CatalogService.updateProduct(Number(id), data);
        return apiResponse(producto);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al actualizar';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        const { id } = await params;
        await CatalogService.deleteProduct(Number(id));
        return apiResponse({ message: 'Producto eliminado' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al eliminar';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}
