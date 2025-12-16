import axios from 'axios';

// Remplace par l'IP locale de ton PC (pas localhost car c'est le téléphone)
// Ex: http://192.168.1.15:3000/api
const API_URL = 'http://10.0.2.2:3000/api'; // 10.0.2.2 est l'alias localhost pour l'émulateur Android

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
