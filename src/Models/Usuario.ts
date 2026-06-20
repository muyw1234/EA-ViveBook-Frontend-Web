import type ILibro from './Libro';

export default interface IUsuario {
  _id: string;
  name: string;
  email: string;
  password?: string;
  authProvider?: 'local' | 'google' | 'apple';
  googleId?: string;
  appleId?: string;
  avatar?: string;
  rol: 'Admin' | 'User';
  libros: ILibro[] | string[]; // Es un array porque claro, un usuario puede tener mas de un libro
  boughtLibros: ILibro[] | string[];
  rentedLibros: ILibro[] | string[];
  favoriteAuthors?: string[];
  favoriteBooks?: ILibro[] | string[] | any[];
  favoriteCategories?: string[];
  wishlist?: string[] | any[];
  followingUsers?: string[];
  favoritos: string[];
  description?: string;
  eventos: string[];
  IsDeleted?: boolean;
  hasSeenTutorial?: boolean;
  expoPushToken?: string;
  notificationUsersEnabled?: string[];
}
