'use server';

import { api } from '@/app/server/api';

export async function handleSubmit(formdata: FormData) {
  try {
    await api.post('user-external/register', {
      name: formdata.get('name'),
      address: formdata.get('address'),
      cpf: formdata.get('cpf'),
      email: formdata.get('email'),
      password: formdata.get('password'),
      phone: formdata.get('phone'),
    });

    return {
      success: true,
      message: 'Cadastro realizado com sucesso',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
