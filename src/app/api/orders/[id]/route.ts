import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { updateOrderStatusSchema } from '@/lib/validators';
import { authenticateRequest, requireAdmin, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = authenticateRequest(request);
        const { id } = await params;
        const usuarioId = payload.rol === 'ADMIN' ? undefined : payload.userId;
        const pedido = await OrderService.getOrderById(Number(id), usuarioId);
        return apiResponse(pedido);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Pedido no encontrado';
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
        const data = updateOrderStatusSchema.parse(body);
        const pedido = await OrderService.updateOrderStatus(Number(id), data.estado);
        return apiResponse(pedido);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al actualizar pedido';
        return apiError(message, message.includes('Acceso') ? 403 : 400);
    }
}
