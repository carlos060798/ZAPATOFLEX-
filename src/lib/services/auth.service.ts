import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'zapatoflex-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: number;
    email: string;
    rol: string;
}

export class AuthService {
    static async register(nombre: string, email: string, password: string) {
        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            throw new Error('El email ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const usuario = await prisma.usuario.create({
            data: { nombre, email, password: hashedPassword },
        });

        const token = this.generateToken(usuario);
        return {
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
            token,
        };
    }

    static async login(email: string, password: string) {
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) {
            throw new Error('Credenciales inválidas');
        }

        const token = this.generateToken(usuario);
        return {
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
            token,
        };
    }

    static generateToken(usuario: { id: number; email: string; rol: string }): string {
        return jwt.sign(
            { userId: usuario.id, email: usuario.email, rol: usuario.rol } as JWTPayload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    static verifyToken(token: string): JWTPayload {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    }

    static async getUserById(id: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: { id: true, nombre: true, email: true, rol: true, createdAt: true, direcciones: true },
        });
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }
}
