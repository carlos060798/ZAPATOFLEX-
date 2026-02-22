import { NextRequest } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { paymentSchema } from '@/lib/validators';
import { authenticateRequest, apiResponse, apiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
    try {
        authenticateRequest(request);
        const body = await request.json();
        const data = paymentSchema.parse(body);
        const result = await PaymentService.processPayment(data.pedidoId, data.metodo);
        return apiResponse(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al procesar pago';
        return apiError(message, message.includes('autenticado') ? 401 : 400);
    }
}
