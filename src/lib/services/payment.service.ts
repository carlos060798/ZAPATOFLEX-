import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
    static async processPayment(pedidoId: number, metodo: string = 'SIMULADO') {
        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            include: { pago: true },
        });

        if (!pedido) throw new Error('Pedido no encontrado');
        if (pedido.pago) throw new Error('Este pedido ya tiene un pago asociado');

        // Simulate payment processing
        const referencia = `PAY-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Simulate random success (95% success rate)
        const exitoso = Math.random() < 0.95;

        const pago = await prisma.pago.create({
            data: {
                pedidoId,
                monto: pedido.total,
                estado: exitoso ? 'COMPLETADO' : 'FALLIDO',
                referencia,
                metodo,
            },
        });

        // Update order status if payment succeeded
        if (exitoso) {
            await prisma.pedido.update({
                where: { id: pedidoId },
                data: { estado: 'CONFIRMADO' },
            });
        }

        return {
            pago,
            exitoso,
            mensaje: exitoso
                ? 'Pago procesado exitosamente'
                : 'El pago fue rechazado. Intente nuevamente.',
        };
    }

    static async getPaymentByOrder(pedidoId: number) {
        const pago = await prisma.pago.findUnique({ where: { pedidoId } });
        if (!pago) throw new Error('Pago no encontrado');
        return pago;
    }
}
