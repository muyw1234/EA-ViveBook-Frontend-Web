export interface ILibro {
    isbn: string;
    title: string;
    authors?: string[];
    type: 'VENTA' | 'ALQUILER';
    precio: number;
    estado: string;
    owner?:  string;
    IsDeleted?: boolean;
    rentalStartDate?: Date;
    rentalEndDate?: Date;
}
