import api from "../../api";

const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
    try {
        const response = await api.post("/auth/signup", userData);
        const { token, user } = response.data;
        if (token) {
            localStorage.setItem("token", token);
        }
        return user; // Return the user object for compatibility
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
        const { token, user } = response.data;
        if (token) {
            console.log("Token recibido y guardado:", token);
            localStorage.setItem("token", token);
        } else {
            console.warn("No se recibió el token en la respuesta del backend:", response.data);
        }
        return response.data;
    } catch (error) {
        console.error("Error authenticating user:", error);
        throw error;
    }
};

const getProfile = async () => {
    // Al llamar a /auth/profile, el interceptor ya puso el token en el Header
    const response = await api.get("/auth/profile");
    return response.data;
};

export default {
    createUser,
    getUserByEmail,
    getProfile
};
