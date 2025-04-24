import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/', // Altere para sua URL
});

// app/server/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Mensagem direta do NestJS (error.response.data)
    const message = error.response?.data || error.message;
    return Promise.reject(message); // Retorna só a string
  }
);

export const checkSession = async () => {
  try {
    const response = await api.get('user/type-user');
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
};
