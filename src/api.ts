import axios from "axios";

const API_URL = "http://localhost:9000";
//const API_URL = "https://ea3-api.upc.edu";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "success" in response.data && "data" in response.data) {
    response.data = response.data.data;
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export const cloudinary_api : string = '991611377853644'; // clave publica

export default api;