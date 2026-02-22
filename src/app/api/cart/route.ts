import { NextRequest } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { cartItemSchema, updateCartItemSchema } from '@/lib/validators';
import { authenticateRequest, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const carrito = await CartService.getOrCreateCart(payload.userId);
        return apiResponse(carrito);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al obtener carrito';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const body = await request.json();
        const data = cartItemSchema.parse(body);
        const carrito = await CartService.addItem(payload.userId, data.productoId, data.cantidad);
        return apiResponse(carrito);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al agregar al carrito';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const body = await request.json();
        const { productoId, ...rest } = body;
        const data = updateCartItemSchema.parse(rest);
        const carrito = await CartService.updateItem(payload.userId, productoId, data.cantidad);
        return apiResponse(carrito);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al actualizar carrito';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const productoId = request.nextUrl.searchParams.get('productoId');

        if (productoId) {
            const carrito = await CartService.removeItem(payload.userId, Number(productoId));
            return apiResponse(carrito);
        } else {
            const carrito = await CartService.clearCart(payload.userId);
            return apiResponse(carrito);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al eliminar del carrito';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}
