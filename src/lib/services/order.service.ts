import { prisma } from '@/lib/prisma';
import { CartService } from './cart.service';
import { stockQueue, emailQueue } from '@/lib/queues';

export class OrderService {
    static async createOrder(usuarioId: number, direccion: string) {
        // Get cart
        const carrito = await CartService.getOrCreateCart(usuarioId);
        if (carrito.items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Verify stock for all items
        for (const item of carrito.items) {
            if (item.producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.producto.nombre}`);
            }
        }

        // Create order with items
        const pedido = await prisma.pedido.create({
            data: {
                usuarioId,
                direccion,
                total: carrito.total,
                items: {
                    create: carrito.items.map((item) => ({
                        productoId: item.productoId,
                        cantidad: item.cantidad,
                        precioUnit: item.producto.precio,
                    })),
                },
            },
            include: {
                items: { include: { producto: true } },
                pago: true,
            },
        });

        // ==========================================
        // OPTIMIZACIÃN: ENQUEUE PARA WORKERS
        // En vez de hacer bloqueantes las consultas de
        // descontar stock y limpiar carrito (que tomaban
        // mÃºltiples ciclos BD), las delegamos a la Cola AsÃ­ncrona.
        // ==========================================
        await stockQueue.add(
            { usuarioId, items: carrito.items },
            { attempts: 3, backoff: 5000 }
        );

        // Opcional: Cola de correo listos para enviar
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        if (usuario?.email) {
            await emailQueue.add(
                { email: usuario.email, ordenId: pedido.id },
                { delay: 1000 }
            );
        }

        return pedido;
    }

    static async getOrderById(id: number, usuarioId?: number) {
        const where: Record<string, unknown> = { id };
        if (usuarioId) where.usuarioId = usuarioId;

        const pedido = await prisma.pedido.findFirst({
            where,
            include: {
                items: { include: { producto: { include: { imagenes: true } } } },
                pago: true,
                usuario: { select: { id: true, nombre: true, email: true } },
            },
        });
        if (!pedido) throw new Error('Pedido no encontrado');
        return pedido;
    }

    static async getUserOrders(usuarioId: number) {
        return prisma.pedido.findMany({
            where: { usuarioId },
            include: {
                items: { include: { producto: { include: { imagenes: true } } } },
                pago: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }

    static async getAllOrders() {
        return prisma.pedido.findMany({
            include: {
                items: { include: { producto: true } },
                pago: true,
                usuario: { select: { id: true, nombre: true, email: true } },
            },
            orderBy: { fecha: 'desc' },
        });
    }

    static async updateOrderStatus(id: number, estado: string) {
        return prisma.pedido.update({
            where: { id },
            data: { estado },
            include: {
                items: { include: { producto: true } },
                pago: true,
            },
        });
    }
}
