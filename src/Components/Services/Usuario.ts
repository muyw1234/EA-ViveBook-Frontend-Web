import api from '../../api';
import type { IUsuario } from '../../Models/Usuario';

const createUser = async (userData: { name: string; email: string; password: string }) => {
  try {
    const response = await api.post('/auth/signup', userData);
    const resData = response.data.data || response.data;
    const token = resData.token;
    const user = resData.user;
    if (token) {
      localStorage.setItem('token', token);
    }
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const getUserByEmail = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/signin', userData);
    const resData = response.data.data || response.data;
    const token = resData.token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn('No se recibió el token en la respuesta del backend:', response.data);
    }
    return resData.user || resData;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  return (response.data.data || response.data) as Partial<IUsuario>;
};

const toggleWishlist = async (bookId: string) => {
  try {
    const response = await api.post(`/usuarios/wishlist/${bookId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

const toggleFavorite = async (bookId: string) => {
  try {
    const response = await api.post(`/usuarios/favoritos/${bookId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

const searchUsuarios = async (term: string, page: number = 1, limit: number = 10) => {
  return await api.get('/usuarios/search', { params: { term, page, limit } });
};

const socialLogin = async (socialData: { provider: string; idToken: string; name?: string }) => {
  try {
    const response = await api.post('/auth/social-login', socialData);
    const resData = response.data.data || response.data;
    const token = resData.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return resData.user || resData;
  } catch (error) {
    console.error('Error social login:', error);
    throw error;
  }
};

export default {
  createUser,
  getUserByEmail,
  getProfile,
  toggleWishlist,
  toggleFavorite,
  searchUsuarios,
  socialLogin,
};
