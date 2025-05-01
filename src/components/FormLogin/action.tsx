'use server';

import { api } from '@/app/server/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  role: string;
}

export async function handleSubmit(formData: FormData) {
  try {
    const response = await api.post('auth/login', {
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const token = response.data.access_token;
    const decoded = jwtDecode<JwtPayload>(token); // Decodifica o token

    return {
      success: true,
      token: token,
      role: decoded.role,
      message: 'Login realizado com sucesso',
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.message || error.message,
    };
  }
}
