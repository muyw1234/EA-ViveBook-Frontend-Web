import api from "../../api";

const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
    try {
        const response = await api.post("/auth/signup", userData);
        const  token = response.data;
        const user = response.data.data; 
        if (token) {
            localStorage.setItem("token", token);
        }
        return user; 
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

const getUserByEmail = async (userData: {
    email: string;
    password: string;
}) => {
    try {
        const response = await api.post("/auth/signin", userData);
        const  token  = response.data.data.token;
        if (token) {
            localStorage.setItem("token", token);
        } else {
            console.warn("No se recibió el token en la respuesta del backend:", response.data);
        }
        return response.data.data;
    } catch (error) {
        console.error("Error authenticating user:", error);
        throw error;
    }
};

const getProfile = async () => {
    const response = await api.get("/auth/profile");
    return response.data.data;
};

export default {
    createUser,
    getUserByEmail,
    getProfile
};
