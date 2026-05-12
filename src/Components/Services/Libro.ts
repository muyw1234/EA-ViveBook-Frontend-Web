import api from "../../api";

const getAllLibros = async () => {
    try {
        const response = await api.get("/libros");
        // Soporte tanto para array plano como para objeto paginado { data: [...] }
        return Array.isArray(response.data) ? response.data : response.data.data;
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

async function addLibroByIsbn(isbn: string) {
    try {
        const response = await api.get(`/libros/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by id:", error);
        throw error;
    }
}

// CORRECCIÓN: Ahora recibe un objeto JSON con la estructura exacta de la base de datos
const addLibroListing = async (bookData: {
    isbn: string;
    title: string;
    authors: string[];
    type: string;
    precio: number;
    estado: string;
}) => {
    try {
        // Enviamos el objeto 'bookData' completo directamente. 
        // Axios se encarga de transformarlo en JSON (application/json) automáticamente.
        const response = await api.post("/libros", bookData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error adding book listing (Server Response):", error.response.data);
        } else {
            console.error("Error adding book listing:", error);
        }
        throw error;
    }
};

export default {
    getAllLibros,
    getLibroById,
    addLibroListing,
    addLibroByIsbn
};