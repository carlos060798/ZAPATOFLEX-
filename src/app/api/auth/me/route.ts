import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { authenticateRequest, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        const payload = authenticateRequest(request);
        const usuario = await AuthService.getUserById(payload.userId);
        return apiResponse(usuario);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'No autenticado';
        return apiError(message, 401);
    }
}
