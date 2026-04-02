type Listener = (data: any) => void;

export class ObservadorInventario {
    private suscriptores: Map<string, Listener[]> = new Map();

    // Singleton pÃºblico
    private static instance: ObservadorInventario;
    static getInstance(): ObservadorInventario {
        if (!ObservadorInventario.instance) {
            ObservadorInventario.instance = new ObservadorInventario();
        }
        return ObservadorInventario.instance;
    }

    suscribir(evento: string, listener: Listener): void {
        if (!this.suscriptores.has(evento)) {
            this.suscriptores.set(evento, []);
        }
        this.suscriptores.get(evento)!.push(listener);
    }

    notificar(evento: string, datos: any): void {
        const listeners = this.suscriptores.get(evento);
        if (listeners) {
            listeners.forEach(l => l(datos));
        }
    }

    // Un mÃ©todo especÃ­fico solicitado por el documento
    notificarCambioStock(productoId: number, nuevoStock: number): void {
        console.log(`[Observer] Notificando cambio stock: Prod ${productoId} -> ${nuevoStock}`);
        this.notificar('stock_change', { productoId, nuevoStock });
    }
}
