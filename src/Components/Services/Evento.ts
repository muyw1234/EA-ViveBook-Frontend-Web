import api from "../../api";

export interface IGeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IEventoData {
    _id?: string; 
    title: string;
    description: string;
    eventDate: Date;
    createdDate: Date;
    location: IGeoJSONPoint;
    direccionExacta: string;
}

const createEvento = async (eventoData: IEventoData) => {
    try {
        const response = await api.post("/eventos", eventoData);
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error("Error creating evento:", error);
        throw error;
    }
};

const getAllEventos = async () => {
    try {
        const response = await api.get("/eventos");
        const data = response.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching eventos:", error);
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
        console.error("Error fetching evento by id:", error);
        throw error;
    }
};

const getEventsAtExactLocation = async (lng: number, lat: number) => {
    try {
        const response = await api.get(`/eventos/exact-location`, {
            params: { lng, lat }
        });
        
        if (response.data && response.data.success) {
            return response.data.data; 
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching events at exact location:", error);
        throw error;
    }
};

export default {
    createEvento,
    getAllEventos,
    getEventoById,
    getEventsAtExactLocation
};