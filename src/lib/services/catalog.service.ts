import { prisma } from '@/lib/prisma';
import { FiltroConCache, FiltroSimple, IEstrategiaFiltro } from '@/patterns/EstrategiaFiltro';
import { IteradorPaginado } from '@/patterns/IteradorCatalogo';
import { CategoriaComposite } from '@/patterns/CategoriaComposite';
import { ObservadorInventario } from '@/patterns/ObservadorInventario';

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
    // ImplementaciÃ³n del PatrÃ³n Strategy + Iterator
    static async getProducts(query: ProductQuery) {
        const { search, categoriaId, minPrecio, maxPrecio, page = 1, limit = 12 } = query;

        // 1. Seleccionar Estrategia (Strategy)
        // Decidimos usar cachÃ© si hay filtros combinados o bÃºsquedas, 
        // para filtros simples o "ver todo" podrÃ­amos usar simple, 
        // pero por defecto usamos la optimizada con CachÃ©.
        const estrategia: IEstrategiaFiltro = new FiltroConCache();
        
        const productosCompletos = await estrategia.filtrar({
            search,
            categoriaId,
            minPrecio,
            maxPrecio
        });

        // 2. Aplicar Recorrido (Iterator)
        const iterador = new IteradorPaginado(productosCompletos, limit);
        
        // Avanzamos el iterador hasta la pÃ¡gina deseada
        let productosPagina: any[] = [];
        for (let i = 1; i <= page; i++) {
            if (iterador.hasNext()) {
                productosPagina = iterador.next();
            } else {
                productosPagina = [];
                break;
            }
        }

        return {
            productos: productosPagina,
            pagination: {
                page,
                limit,
                total: iterador.getTotal(),
                totalPages: iterador.getPaginas(),
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

    // ImplementaciÃ³n del PatrÃ³n Composite
    static async getCategoriesTree() {
        const categoriasRaw = await prisma.categoria.findMany({
            include: { _count: { select: { productos: true } } },
        });

        // En un escenario real, buscarÃ­amos relaciones parentId. 
        // AquÃ­ simulamos la estructura jerÃ¡rquica exigida por el Composite.
        const root = new CategoriaComposite(0, "RaÃ­z");
        
        categoriasRaw.forEach(cat => {
            const nodo = new CategoriaComposite(cat.id, cat.nombre, cat._count.productos);
            root.agregar(nodo);
        });

        return root.toJSON().subcategorias;
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

        // ImplementaciÃ³n del PatrÃ³n Observer
        if (data.stock !== undefined) {
            ObservadorInventario.getInstance().notificarCambioStock(id, data.stock);
        }

        return producto;
    }

    static async deleteProduct(id: number) {
        await prisma.producto.delete({ where: { id } });
    }
}

