import { prisma } from '@/lib/prisma';

interface ProductQuery {
    search?: string;
    categoriaId?: number;
    minPrecio?: number;
    maxPrecio?: number;
    page?: number;
    limit?: number;
    orderBy?: string;
}

export class CatalogService {
    static async getProducts(query: ProductQuery) {
        const { search, categoriaId, minPrecio, maxPrecio, page = 1, limit = 12, orderBy = 'reciente' } = query;

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { nombre: { contains: search } },
                { descripcion: { contains: search } },
            ];
        }
        if (categoriaId) where.categoriaId = categoriaId;
        if (minPrecio || maxPrecio) {
            where.precio = {};
            if (minPrecio) (where.precio as Record<string, unknown>).gte = minPrecio;
            if (maxPrecio) (where.precio as Record<string, unknown>).lte = maxPrecio;
        }

        let orderByClause: Record<string, string> = {};
        switch (orderBy) {
            case 'precio_asc': orderByClause = { precio: 'asc' }; break;
            case 'precio_desc': orderByClause = { precio: 'desc' }; break;
            case 'nombre': orderByClause = { nombre: 'asc' }; break;
            default: orderByClause = { createdAt: 'desc' };
        }

        const [productos, total] = await Promise.all([
            prisma.producto.findMany({
                where,
                include: { categoria: true, imagenes: true },
                orderBy: orderByClause,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.producto.count({ where }),
        ]);

        return {
            productos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getProductById(id: number) {
        const producto = await prisma.producto.findUnique({
            where: { id },
            include: { categoria: true, imagenes: true, inventario: true },
        });
        if (!producto) throw new Error('Producto no encontrado');
        return producto;
    }

    static async getProductBySlug(slug: string) {
        const producto = await prisma.producto.findUnique({
            where: { slug },
            include: { categoria: true, imagenes: true, inventario: true },
        });
        if (!producto) throw new Error('Producto no encontrado');
        return producto;
    }

    static async getCategories() {
        return prisma.categoria.findMany({
            include: { _count: { select: { productos: true } } },
        });
    }

    static async createProduct(data: {
        nombre: string;
        descripcion: string;
        precio: number;
        stock: number;
        categoriaId: number;
        imagenes?: string[];
    }) {
        const slug = data.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const producto = await prisma.producto.create({
            data: {
                nombre: data.nombre,
                slug,
                descripcion: data.descripcion,
                precio: data.precio,
                stock: data.stock,
                categoriaId: data.categoriaId,
                imagenes: data.imagenes ? {
                    create: data.imagenes.map((url) => ({ url, alt: data.nombre })),
                } : undefined,
                inventario: {
                    create: { cantidad: data.stock, minimo: 5 },
                },
            },
            include: { categoria: true, imagenes: true },
        });
        return producto;
    }

    static async updateProduct(id: number, data: Partial<{
        nombre: string;
        descripcion: string;
        precio: number;
        stock: number;
        categoriaId: number;
    }>) {
        const producto = await prisma.producto.update({
            where: { id },
            data,
            include: { categoria: true, imagenes: true },
        });
        return producto;
    }

    static async deleteProduct(id: number) {
        await prisma.producto.delete({ where: { id } });
    }
}
