import { z } from 'zod';

export const registerSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export const productQuerySchema = z.object({
    search: z.string().optional(),
    categoriaId: z.coerce.number().optional(),
    minPrecio: z.coerce.number().optional(),
    maxPrecio: z.coerce.number().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
    orderBy: z.enum(['precio_asc', 'precio_desc', 'nombre', 'reciente']).default('reciente'),
});

export const cartItemSchema = z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
    cantidad: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    direccion: z.string().min(5, 'La dirección es requerida'),
});

export const updateOrderStatusSchema = z.object({
    estado: z.enum(['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']),
});

export const paymentSchema = z.object({
    pedidoId: z.number().int().positive(),
    metodo: z.enum(['SIMULADO', 'TARJETA', 'PAYPAL']).default('SIMULADO'),
});

export const updateStockSchema = z.object({
    cantidad: z.number().int().min(0),
    minimo: z.number().int().min(0).optional(),
});

export const productCreateSchema = z.object({
    nombre: z.string().min(2),
    descripcion: z.string().min(10),
    precio: z.number().positive(),
    stock: z.number().int().min(0),
    categoriaId: z.number().int().positive(),
    imagenes: z.array(z.string()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();
