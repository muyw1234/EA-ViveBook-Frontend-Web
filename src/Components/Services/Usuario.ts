import type { AxiosResponse } from 'axios';
import api from '../../api';
import type IUsuario from '../../Models/Usuario';
import Image from './Image';
import { unwrapApiData } from '../../utils/apiResponse';
import { setSessionToken } from '../../utils/session';

const createUser = async (userData: { name: string; email: string; password: string }) => {
  try {
    const response = await api.post('/auth/signup', userData);
    const resData = unwrapApiData<{ token?: string; user?: IUsuario }>(response.data);
    const token = resData.token;
    const user = resData.user;
    if (token) {
      setSessionToken(token);
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
    const resData = unwrapApiData<{ token?: string; user?: IUsuario }>(response.data);
    const token = resData.token;
    if (token) {
      setSessionToken(token);
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
  const response = await api.get('/auth/profile');

  return unwrapApiData<Partial<IUsuario>>(response.data);
};

const toggleWishlist = async (bookId: string) => {
  try {
    const response = await api.post(`/usuarios/wishlist/${bookId}`);
    return unwrapApiData(response.data);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

const toggleFavorite = async (bookId: string) => {
  try {
    const response = await api.post(`/usuarios/favoritos/${bookId}`);
    return unwrapApiData(response.data);
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
    const resData = unwrapApiData<{ token?: string; user?: IUsuario }>(response.data);
    const token = resData.token;
    if (token) {
      setSessionToken(token);
    }
    return resData.user || resData;
  } catch (error) {
    console.error('Error social login:', error);
    throw error;
  }
};

async function updateUsuario(
  userData: Partial<IUsuario>,
  payload: any,
): Promise<AxiosResponse<Partial<IUsuario>>> {
  return await api.put(`/usuarios/${userData._id}`, payload);
}

async function changeAvatar(
  data: FormData,
  userData: Partial<IUsuario>,
): Promise<Partial<IUsuario> | undefined> {
  const url = await Image.upload(data);

  const user = await updateUsuario(userData, { avatar: url });
  return user.data;
}

export default {
  createUser,
  getUserByEmail,
  getProfile,
  toggleWishlist,
  toggleFavorite,
  searchUsuarios,
  socialLogin,
  updateUsuario,
  changeAvatar,
};
