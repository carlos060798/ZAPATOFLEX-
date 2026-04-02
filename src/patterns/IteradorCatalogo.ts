export interface IIteradorCatalogo<T> {
    next(): T[];
    hasNext(): boolean;
    reset(): void;
    getTotal(): number;
    getPaginas(): number;
}

export class IteradorPaginado<T> implements IIteradorCatalogo<T> {
    private posicion = 1;

    constructor(
        private items: T[],
        private tamanoPagina: number = 12
    ) {}

    next(): T[] {
        const inicio = (this.posicion - 1) * this.tamanoPagina;
        const fin = inicio + this.tamanoPagina;
        const resultado = this.items.slice(inicio, fin);
        this.posicion++;
        return resultado;
    }

    hasNext(): boolean {
        return (this.posicion - 1) * this.tamanoPagina < this.items.length;
    }

    reset(): void {
        this.posicion = 1;
    }

    getTotal(): number {
        return this.items.length;
    }

    getPaginas(): number {
        return Math.ceil(this.items.length / this.tamanoPagina);
    }
}
