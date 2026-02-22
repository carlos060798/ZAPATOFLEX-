import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { registerSchema } from '@/lib/validators';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = registerSchema.parse(body);
        const result = await AuthService.register(data.nombre, data.email, data.password);

        const response = apiResponse(result, 201);
        return response;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error en el registro';
        return apiError(message, message.includes('registrado') ? 409 : 400);
    }
}
