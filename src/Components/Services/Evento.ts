import api from '../../api';

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

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error creating evento:', error);
    throw error;
  }
};

const getAllEventos = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await api.get('/eventos', { params: { page, limit } });
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching eventos:', error);
    throw error;
  }
};

const getEventoById = async (id: string) => {
  try {
    const response = await api.get(`/eventos/${id}`);

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
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

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching events at exact location:', error);
    throw error;
  }
};

const participateInEvento = async (eventoId: string, usuarioId: string) => {
  try {
    const response = await api.put(`/eventos/${eventoId}/participate`, { usuarioId });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error registering participation in evento:', error);
    throw error;
  }
};
const leaveEvento = async (eventoId: string, usuarioId: string) => {
  const response = await api.put(`/eventos/${eventoId}/leave`, { usuarioId });
  return response.data.data;
};
export default {
  createEvento,
  getAllEventos,
  getEventoById,
  getEventsAtExactLocation,
  participateInEvento,
  leaveEvento,
};
