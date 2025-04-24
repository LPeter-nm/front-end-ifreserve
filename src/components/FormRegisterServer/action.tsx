'use server';

import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    await api.post('server/register', {
      name: formData.get('name'),
      registration: formData.get('registration'),
      function_Server: formData.get('functionServer'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    return {
      success: true,
      message: 'Cadastro realizado com sucesso!',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
