// import axios from "axios";

import { toast } from 'react-toastify';
import api, { cloudinary_api } from '../../api';
import axios from 'axios';

export interface Token {
  timestamp: number;
  signature: string;
}

/**
 * @brief Obtiene el token para subir la imagen a cloudinary
 * @returns El token
 */
async function getToken(): Promise<Token | undefined> {
  try {
    return (await api.get('/image/token')).data.token;
  } catch (error) {
    toast.error(JSON.stringify(error));
    return;
  }
}

/**
 * @brief Subir imagen
 * @return Devuelve la url segura de la imagen.
 */
async function upload(data: FormData): Promise<string | undefined> {
  const token: Token = (await getToken())!;
  // data.append('file',fileObject); // se supone que ya lo tiene
  data.append('api_key', cloudinary_api);
  data.append('timestamp', `${token.timestamp}`);
  data.append('signature', token.signature);
  try {
    const res = await await axios.post(
      `https://api.cloudinary.com/v1_1/df2qxcelv/image/upload`,
      data,
      {
        // tambien tendria que extraer el cloudname en variables de entornos ...
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return res.data.secure_url;
  } catch (error) {
    toast.error(JSON.stringify(error));
    return;
  }
}

export default { upload };
