
export type SellType = 'VENTA' | 'ALQUILER';
// Faltan muchos modelos -_-
export default interface ILibro {
    _id: string; 
    isbn: string;
    title: string;
    authors?: string[];
    autor?: string;
    categoria?: string;
    type: SellType;
    precio: number;
    estado: string;
    owner?: string;
    IsDeleted?: boolean;
    rentalStartDate?: Date;
    rentalEndDate?: Date;
    imageUrl?: string;
    isReserved?: boolean;
    reservedBy?: string;
}