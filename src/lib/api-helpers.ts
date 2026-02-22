import { NextRequest } from 'next/server';
import { AuthService, JWTPayload } from '@/lib/services/auth.service';

export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    const cookie = request.cookies.get('token');
    return cookie?.value || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload {
    const token = getTokenFromRequest(request);
    if (!token) throw new Error('No autenticado');
    return AuthService.verifyToken(token);
}

export function requireAdmin(request: NextRequest): JWTPayload {
    const payload = authenticateRequest(request);
    if (payload.rol !== 'ADMIN') throw new Error('Acceso denegado: se requiere rol de administrador');
    return payload;
}

export function apiResponse(data: unknown, status: number = 200) {
    return Response.json(data, { status });
}

export function apiError(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}
