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

async function addLibroByIsbn(isbn : string){
    try{
        const response = await api.get(`/libros/isbn/${isbn}`);
        return response.data;
    }
    catch (error){
         console.error("Error fetching book by id:", error);
        throw error;
    }
}

const addLibroListing = async (formData: FormData) => {
    try {
        const author = formData.get("author") as string;
        const payload = {
            isbn: formData.get("isbn") as string,
            title: formData.get("title") as string,
            author: author,
            authors: author ? [author] : [],
            type: formData.get("status") as string,
            precio: Number(formData.get("price")),
            price: Number(formData.get("price")),
            estado: formData.get("state") as string,
        };
        const response = await api.post("/libros", payload);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error adding book listing (Server Response):", error.response.data);
        } else {
            console.error("Error adding book listing:", error);
        }
        throw error;
    }
}

export default {
    getAllLibros,
    getLibroById,
    addLibroListing,
    addLibroByIsbn
};
