import { prisma } from '@/lib/prisma';

export class CartService {
    static async getOrCreateCart(usuarioId: number) {
        let carrito = await prisma.carrito.findUnique({
            where: { usuarioId },
            include: {
                items: {
                    include: { producto: { include: { imagenes: true } } },
                    orderBy: { id: 'asc' },
                },
            },
        });

        if (!carrito) {
            carrito = await prisma.carrito.create({
                data: { usuarioId },
                include: {
                    items: {
                        include: { producto: { include: { imagenes: true } } },
                        orderBy: { id: 'asc' },
                    },
                },
            });
        }

        const total = carrito.items.reduce(
            (sum, item) => sum + item.producto.precio * item.cantidad, 0
        );

        return { ...carrito, total };
    }

    static async addItem(usuarioId: number, productoId: number, cantidad: number = 1) {
        const carrito = await this.getOrCreateCart(usuarioId);

        // Check stock
        const producto = await prisma.producto.findUnique({ where: { id: productoId } });
        if (!producto) throw new Error('Producto no encontrado');
        if (producto.stock < cantidad) throw new Error('Stock insuficiente');

        // Check if item already exists
        const existingItem = await prisma.carritoItem.findUnique({
            where: { carritoId_productoId: { carritoId: carrito.id, productoId } },
        });

        if (existingItem) {
            const newCantidad = existingItem.cantidad + cantidad;
            if (producto.stock < newCantidad) throw new Error('Stock insuficiente');
            await prisma.carritoItem.update({
                where: { id: existingItem.id },
                data: { cantidad: newCantidad },
            });
        } else {
            await prisma.carritoItem.create({
                data: { carritoId: carrito.id, productoId, cantidad },
            });
        }

        return this.getOrCreateCart(usuarioId);
    }

    static async updateItem(usuarioId: number, productoId: number, cantidad: number) {
        const carrito = await this.getOrCreateCart(usuarioId);

        const producto = await prisma.producto.findUnique({ where: { id: productoId } });
        if (!producto) throw new Error('Producto no encontrado');
        if (producto.stock < cantidad) throw new Error('Stock insuficiente');

        await prisma.carritoItem.update({
            where: { carritoId_productoId: { carritoId: carrito.id, productoId } },
            data: { cantidad },
        });

        return this.getOrCreateCart(usuarioId);
    }

    static async removeItem(usuarioId: number, productoId: number) {
        const carrito = await this.getOrCreateCart(usuarioId);

        await prisma.carritoItem.delete({
            where: { carritoId_productoId: { carritoId: carrito.id, productoId } },
        });

        return this.getOrCreateCart(usuarioId);
    }

    static async clearCart(usuarioId: number) {
        const carrito = await prisma.carrito.findUnique({ where: { usuarioId } });
        if (carrito) {
            await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } });
        }
        return this.getOrCreateCart(usuarioId);
    }
}
