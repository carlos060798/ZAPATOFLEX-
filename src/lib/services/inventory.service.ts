import { prisma } from '@/lib/prisma';

export class InventoryService {
    static async getStock(productoId: number) {
        const inventario = await prisma.inventario.findUnique({
            where: { productoId },
            include: { producto: { select: { nombre: true, stock: true } } },
        });
        if (!inventario) throw new Error('Registro de inventario no encontrado');
        return inventario;
    }

    static async updateStock(productoId: number, cantidad: number, minimo?: number) {
        const data: Record<string, unknown> = { cantidad };
        if (minimo !== undefined) data.minimo = minimo;

        // Update both inventory and product stock
        const [inventario] = await Promise.all([
            prisma.inventario.update({
                where: { productoId },
                data,
                include: { producto: { select: { nombre: true } } },
            }),
            prisma.producto.update({
                where: { id: productoId },
                data: { stock: cantidad },
            }),
        ]);

        return inventario;
    }

    static async getLowStockAlerts() {
        const inventarios = await prisma.inventario.findMany({
            include: { producto: { include: { categoria: true } } },
        });

        return inventarios
            .filter((inv) => inv.cantidad <= inv.minimo)
            .map((inv) => ({
                productoId: inv.productoId,
                nombre: inv.producto.nombre,
                categoria: inv.producto.categoria.nombre,
                cantidadActual: inv.cantidad,
                minimo: inv.minimo,
                alerta: inv.cantidad === 0 ? 'SIN_STOCK' : 'BAJO_STOCK',
            }));
    }

    static async getInventoryReport() {
        const inventarios = await prisma.inventario.findMany({
            include: { producto: { include: { categoria: true, imagenes: true } } },
            orderBy: { cantidad: 'asc' },
        });

        const totalProductos = inventarios.length;
        const sinStock = inventarios.filter((i) => i.cantidad === 0).length;
        const bajoStock = inventarios.filter((i) => i.cantidad > 0 && i.cantidad <= i.minimo).length;
        const enStock = inventarios.filter((i) => i.cantidad > i.minimo).length;

        return {
            resumen: { totalProductos, sinStock, bajoStock, enStock },
            items: inventarios.map((inv) => ({
                productoId: inv.productoId,
                nombre: inv.producto.nombre,
                categoria: inv.producto.categoria.nombre,
                cantidad: inv.cantidad,
                minimo: inv.minimo,
                estado: inv.cantidad === 0 ? 'SIN_STOCK' : inv.cantidad <= inv.minimo ? 'BAJO_STOCK' : 'EN_STOCK',
            })),
        };
    }
}
