export type SellType = 'VENTA' | 'ALQUILER';

export type LibroOwner =
  | string
  | {
      _id: string;
      name?: string;
      email?: string;
    };

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
  owner?: LibroOwner;
  IsDeleted?: boolean;
  rentalStartDate?: Date;
  rentalEndDate?: Date;
  imageUrl?: string;
  isReserved?: boolean;
  reservedBy?: string | { _id: string; name?: string };
}
