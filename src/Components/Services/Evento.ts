import api from '../../api';
import { getApiCollection, unwrapApiData } from '../../utils/apiResponse';

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IEventoData {
  _id?: string;
  title: string;
  description: string;
  participant?: string[];
  eventDate: Date;
  createdDate: Date;
  location: IGeoJSONPoint;
  direccionExacta: string;
}

const createEvento = async (eventoData: IEventoData) => {
  try {
    const response = await api.post('/eventos', eventoData);
    return unwrapApiData<any>(response.data);
  } catch (error) {
    console.error('Error creating evento:', error);
    throw error;
  }
};

export const getAllEventos = async (
  page: number = 1,
  limit: number = 10,
  timeFilter?: 'upcoming' | 'expired'
): Promise<any> => { 
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (timeFilter) {
      params.append('timeFilter', timeFilter);
    }

    const response = await api.get(`/eventos?${params.toString()}`);
    
    return response.data; 
  } catch (error) {
    console.error('Error en getAllEventos Service:', error);
    throw error;
  }
};

const getEventoById = async (id: string) => {
  try {
    const response = await api.get(`/eventos/${id}`);
    return unwrapApiData<any>(response.data);
  } catch (error) {
    console.error('Error fetching evento by id:', error);
    throw error;
  }
};

const getEventsAtExactLocation = async (lng: number, lat: number) => {
  try {
    const response = await api.get(`/eventos/exact-location`, {
      params: { lng, lat },
    });

    return getApiCollection<IEventoData>(response.data);
  } catch (error) {
    console.error('Error fetching events at exact location:', error);
    throw error;
  }
};

const participateInEvento = async (eventoId: string, usuarioId: string) => {
  try {
    const response = await api.put(`/eventos/${eventoId}/participate`, { usuarioId });
    return unwrapApiData<any>(response.data);
  } catch (error) {
    console.error('Error registering participation in evento:', error);
    throw error;
  }
};
const leaveEvento = async (eventoId: string, usuarioId: string) => {
  const response = await api.put(`/eventos/${eventoId}/leave`, { usuarioId });
  return unwrapApiData<any>(response.data);
};
export default {
  createEvento,
  getAllEventos,
  getEventoById,
  getEventsAtExactLocation,
  participateInEvento,
  leaveEvento,
};
