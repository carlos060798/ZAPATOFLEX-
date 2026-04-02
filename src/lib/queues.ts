import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || '';

// Wrappers para evitar errores fatales locales si no hay Redis configurado en un entorno simple
const createQueue = (name: string) => {
  if (!REDIS_URL) {
      console.warn(`[QUEUES] No se ha definido REDIS_URL. Cola asÃ­ncrona ${name} estÃ¡ inactiva.`);
      // Mock de una cola para que las funciones dependientes no rompan
      return {
          add: async (data: any, opts: any) => { console.warn(`Simulando enqueue en ${name}:`, data); },
          process: (callback: any) => { console.warn(`Simulando process handler para ${name}.`); }
      } as any as Bull.Queue;
  }
  return new Bull(name, REDIS_URL);
};

export const paymentQueue = createQueue('payments');
export const emailQueue = createQueue('emails');
export const stockQueue = createQueue('stock');

// ==========================================
// WORKERS (Consumidores de las colas)
// ==========================================

import { prisma } from '@/lib/prisma';
import { CartService } from '@/lib/services/cart.service';

stockQueue.process(async (job) => {
    const { usuarioId, items } = job.data;
    console.log(`[Worker STOCK] Procesando actualizaciÃ³n de stock para ${items.length} items...`);
    
    try {
        for (const item of items) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: { stock: { decrement: item.cantidad } },
            });
            await prisma.inventario.updateMany({
                where: { productoId: item.productoId },
                data: { cantidad: { decrement: item.cantidad } },
            });
        }
        
        // Limpiamos el carrito despuÃ©s de asegurar el stock
        await CartService.clearCart(usuarioId);
        console.log(`[Worker STOCK] Terminado con Ã©xito.`);
    } catch (err) {
        console.error(`[Worker STOCK Error]`, err);
        throw err; // Trigger Bull retry
    }
});

emailQueue.process(async (job) => {
    const { email, ordenId } = job.data;
    // SimulaciÃ³n de envÃ­o de email (SMTP, SendGrid, etc.)
    console.log(`[Worker EMAIL] Enviando confirmaciÃ³n de orden #${ordenId} a ${email}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[Worker EMAIL] Enviado correctamente.`);
});
