import api from "../../api";

const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
    try {
        const response = await api.post("/auth/signup", userData);
        return response.data;
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
        //EL TOKEN SE GUARDA EN LOCAL CON localStorage
        const token = response.data.token || response.headers['auth-token'];
        if (token) {
            localStorage.setItem("token", token);
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
