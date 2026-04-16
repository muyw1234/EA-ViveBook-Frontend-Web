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

const addLibroListing = async (formData: FormData) => {
    try {
        // Revertir temporalmente: Enviar solo campos básicos para evitar el error 500
        const payload = {
            isbn: formData.get("isbn") as string,
            title: formData.get("title") as string,
        };
        const response = await api.post("/libros", payload);
        return response.data;
    } catch (error) {
        console.error("Error adding book listing:", error);
        throw error;
    }
}

export default {
    getAllLibros,
    getLibroById,
    addLibroListing
};
