import api from "../../api";
import type IReto from "../../Models/Reto";

const getRetos = async (): Promise<IReto[]> => {
    try {
        const response = await api.get("/retos");
        const data = response.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching challenges:", error);
        throw error;
    }
};

const getMisRetos = async (): Promise<IReto[]> => {
    try {
        const response = await api.get("/retos/mis-retos");
        const data = response.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching user challenges:", error);
        throw error;
    }
};

export default {
    getRetos,
    getMisRetos
};
