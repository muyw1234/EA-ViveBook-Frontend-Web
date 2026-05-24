export interface IUsuario {
    name: string;
    email: string;
    password: string;
    rol: 'Admin' | 'User';
    libros:  string[]; // Es un array porque claro, un usuario puede tener mas de un libro
    boughtLibros:  string[];
    rentedLibros:  string[];
    favoriteAuthors?: string[];
    favoriteBooks?: string[];
    favoriteCategories?: string[];
    followingUsers?:  string[];
    description?: string;
    IsDeleted?: boolean;
    imageUrl?: string;
}