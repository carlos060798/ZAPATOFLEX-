import { NextRequest } from 'next/server';
2: import { CatalogService } from '@/lib/services/catalog.service';
3: import { productQuerySchema } from '@/lib/validators';
4: import { apiResponse, apiError } from '@/lib/api-helpers';
5: 
6: /**
7:  * Endpoint especializado para el informe "Navegando Mareas".
8:  * Utiliza formalmente el PatrÃ³n Strategy para filtrar y Iterator para paginar.
9:  */
10: export async function POST(request: NextRequest) {
11:     try {
12:         const body = await request.json();
13:         
14:         // Validamos los criterios de navegaciÃ³n
15:         const query = productQuerySchema.parse(body);
16:         
17:         // El Servicio coordina la Estrategia y el Iterador
18:         const result = await CatalogService.getProducts(query);
19:         
20:         return apiResponse(result);
21:     } catch (error: unknown) {
22:         const message = error instanceof Error ? error.message : 'Error en la navegaciÃ³n del catÃ¡logo';
23:         return apiError(message);
24:     }
25: }
26: 
27: // TambiÃ©n habilitamos GET para compatibilidad con diagramas de secuencia
28: export async function GET(request: NextRequest) {
29:     try {
30:         const searchParams = Object.fromEntries(request.nextUrl.searchParams);
31:         const query = productQuerySchema.parse(searchParams);
32:         const result = await CatalogService.getProducts(query);
33:         return apiResponse(result);
34:     } catch (error: unknown) {
35:         return apiError(error instanceof Error ? error.message : 'Error');
36:     }
37: }
38: 
