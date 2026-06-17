import api from '../../api';
import type ILibro from '../../Models/Libro';
import { normalizeLibro, normalizeLibros } from '../../utils/libro';

const getAllLibros = async (
  page: number = 1,
  limit: number = 10,
  type?: string,
): Promise<ILibro[]> => {
  try {
    const response = await api.get('/libros', { params: { page, limit, type } });
    return normalizeLibros(response.data);
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

const getLibroById = async (id: string) => {
  try {
    const response = await api.get(`/libros/${id}`);
    return normalizeLibro(response.data);
  } catch (error) {
    console.error('Error fetching book by id:', error);
    throw error;
  }
};

async function addLibroByIsbn(isbn: string) {
  try {
    const response = await api.get(`/libros/isbn/${isbn}`);
    return normalizeLibro(response.data);
  } catch (error) {
    console.error('Error adding book by ISBN:', error);
    throw error;
  }
}

const addLibroListing = async (bookData: {
  isbn: string;
  title: string;
  authors: string[];
  type: string;
  precio: number;
  estado: string;
  imageUrl?: string | null;
}) => {
  try {
    const response = await api.post('/libros', bookData);
    /* await Matomo.AddingBook(bookData as Partial<ILibro>); // observer o event dispatcher o callback, llamalo como quieras. */
    return normalizeLibro(response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Error adding book listing (Server Response):', error.response.data);
    } else {
      console.error('Error adding book listing:', error);
    }
    throw error;
  }
};

async function searchLibro(term: string, page: number = 1, limit: number = 10): Promise<ILibro[]> {
  const response = await api.get('/libros/search', { params: { term, page, limit } });
  return normalizeLibros(response.data);
}

export default {
  getAllLibros,
  getLibroById,
  addLibroListing,
  addLibroByIsbn,
  searchLibro,
};
