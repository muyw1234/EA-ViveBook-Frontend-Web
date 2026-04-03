import axios from "axios";

const API_URL = "http://localhost:1337";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;