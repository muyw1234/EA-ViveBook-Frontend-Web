import api from "../../api";

const getAllLibros = async () => {
    try {
        const response = await api.get("/libros");
        const data = response.data;

        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

const getLibroById = async (id: string) => {
    try {
        const response = await api.get(`/libros/${id}`);
        
        if (response.data && response.data.success) {
            return response.data.data; 
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching book by id:", error);
        throw error;
    }
};

async function addLibroByIsbn(isbn: string) {
    try {
        const response = await api.post(`/libros/isbn/${isbn}`);
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error("Error adding book by ISBN:", error);
        throw error;
    }
}

const addLibroListing = async (bookData: {
    isbn: string;
    title: string;
    authors: string[];
    type: string;
    precio: number;
    estado: string;
}) => {
    try {
        const response = await api.post("/libros", bookData);
        
        if (response.data && response.data.success) {
            return response.data.data; 
        }
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

async function searchLibro(
    term: string, 
    /* setter: Dispatch<SetStateAction<Partial<ILibro>[]>>,  */
    page: number = 1, 
    limit: number = 10
) {
    /* api.get('/libros/search', { params: { term, page, limit } })
        .then((res: AxiosResponse<any>) => {
            // ? No lo compliques, el componente ya se da cuenta de que el array esta vacio
            // if (res.data && res.data.success) {
            //     setter(res.data.data); 
            // } else {
            //     setter(Array.isArray(res.data) ? res.data : []);
            // } 
            console.log(`${JSON.stringify(res.data)} items has been found.`)
                setter(res.data!);
        })
        .catch((error) => {
            const errorMsg = error.response?.data?.message || "Error en la búsqueda";
            toast.error(errorMsg);
        }); */

        return await api.get('/libros/search', { params: { term, page, limit } });
}

export default {
    getAllLibros,
    getLibroById,
    addLibroListing,
    addLibroByIsbn,
    searchLibro
};