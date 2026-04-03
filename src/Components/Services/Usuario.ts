import api from "../../api";

const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
    try {
        const response = await api.post("/usuarios", userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export default {
    createUser,
};