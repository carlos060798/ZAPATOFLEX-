import { prisma } from '@/lib/prisma';
import { redis, getCachedData, setCachedData } from '@/lib/redis';

export interface CriteriosFiltro {
    search?: string;
    categoriaId?: number;
    minPrecio?: number;
    maxPrecio?: number;
}

export interface IEstrategiaFiltro {
    filtrar(criterios: CriteriosFiltro): Promise<any[]>;
}

// ImplementaciÃ³n: Filtro Simple (Directo a Prisma)
export class FiltroSimple implements IEstrategiaFiltro {
    async filtrar(criterios: CriteriosFiltro): Promise<any[]> {
        const where: any = {};
        if (criterios.search) {
            where.OR = [
                { nombre: { contains: criterios.search, mode: 'insensitive' } },
                { descripcion: { contains: criterios.search, mode: 'insensitive' } },
            ];
        }
        if (criterios.categoriaId) where.categoriaId = criterios.categoriaId;
        if (criterios.minPrecio || criterios.maxPrecio) {
            where.precio = {};
            if (criterios.minPrecio) where.precio.gte = criterios.minPrecio;
            if (criterios.maxPrecio) where.precio.lte = criterios.maxPrecio;
        }

        return prisma.producto.findMany({
            where,
            include: { categoria: true, imagenes: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}

// ImplementaciÃ³n: Filtro Con CachÃ© (Usa Redis para velocidad extrema)
export class FiltroConCache implements IEstrategiaFiltro {
    private strategy = new FiltroSimple();

    async filtrar(criterios: CriteriosFiltro): Promise<any[]> {
        const cacheKey = `cat:filt:${JSON.stringify(criterios)}`;
        
        // Intentar obtener de cachÃ©
        const cached = await getCachedData<any[]>(cacheKey);
        if (cached) {
            console.log(`[Strategy] Cache HIT para ${cacheKey}`);
            return cached;
        }

        // Si no, delegar en FiltroSimple y guardar
        const resultados = await this.strategy.filtrar(criterios);
        await setCachedData(cacheKey, resultados, 3600); // 1 hora TTL
        console.log(`[Strategy] Cache MISS. Guardando en Redis.`);
        
        return resultados;
    }
}
