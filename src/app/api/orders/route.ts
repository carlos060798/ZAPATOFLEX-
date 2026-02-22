import { NextRequest } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { createOrderSchema } from '@/lib/validators';
import { authenticateRequest, requireAdmin, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const isAdmin = request.nextUrl.searchParams.get('all') === 'true';

        if (isAdmin && payload.rol === 'ADMIN') {
            const pedidos = await OrderService.getAllOrders();
            return apiResponse(pedidos);
        }

        const pedidos = await OrderService.getUserOrders(payload.userId);
        return apiResponse(pedidos);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener pedidos';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const body = await request.json();
        const data = createOrderSchema.parse(body);
        const pedido = await OrderService.createOrder(payload.userId, data.direccion);
        return apiResponse(pedido, 201);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al crear pedido';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}
