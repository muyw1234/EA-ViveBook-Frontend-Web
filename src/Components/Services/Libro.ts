import api from "../../api";

const getAllLibros = async () => {
    try {
        const response = await api.get("/libros");
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

const getLibroById = async (id: string) => {
    try {
        const response = await api.get(`/libros/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by id:", error);
        throw error;
    }
};

export default {
    getAllLibros,
    getLibroById
};
