import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Restore token from localStorage on page load
const token = localStorage.getItem("accessToken");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
