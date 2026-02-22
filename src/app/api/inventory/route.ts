import { NextRequest } from 'next/server';
import { InventoryService } from '@/lib/services/inventory.service';
import { updateStockSchema } from '@/lib/validators';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        requireAdmin(request);
        const tipo = request.nextUrl.searchParams.get('tipo');

        if (tipo === 'alertas') {
            const alertas = await InventoryService.getLowStockAlerts();
            return apiResponse(alertas);
        }

        const report = await InventoryService.getInventoryReport();
        return apiResponse(report);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener inventario';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}

export async function PUT(request: NextRequest) {
    try {
        requireAdmin(request);
        const body = await request.json();
        const { productoId, ...rest } = body;
        const data = updateStockSchema.parse(rest);
        const inventario = await InventoryService.updateStock(productoId, data.cantidad, data.minimo);
        return apiResponse(inventario);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al actualizar inventario';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}
