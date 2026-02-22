import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { loginSchema } from '@/lib/validators';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = loginSchema.parse(body);
        const result = await AuthService.login(data.email, data.password);

        return apiResponse(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error en el login';
        return apiError(message, 401);
    }
}
