import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/', // Altere para sua URL
  withCredentials: true, // Importante para cookies/sessão
});

export const checkSession = async () => {
  try {
    const response = await api.get('user/type-user');
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
};
