export class CategoriaComposite {
    private hijos: CategoriaComposite[] = [];
    private productosCount: number = 0;

    constructor(
        public id: number,
        public nombre: string,
        productosCount: number = 0
    ) {
        this.productosCount = productosCount;
    }

    agregar(categoria: CategoriaComposite): void {
        this.hijos.push(categoria);
    }

    obtenerHijos(): CategoriaComposite[] {
        return this.hijos;
    }

    // El mÃ©todo recursivo caracterÃ­stico del Composite
    obtenerTotalProductos(): number {
        let total = this.productosCount;
        for (const hijo of this.hijos) {
            total += hijo.obtenerTotalProductos();
        }
        return total;
    }

    // Convierte a objeto plano para API
    toJSON(): any {
        return {
            id: this.id,
            nombre: this.nombre,
            totalProductos: this.obtenerTotalProductos(),
            subcategorias: this.hijos.map(h => h.toJSON())
        };
    }
}
