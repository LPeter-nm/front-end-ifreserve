'use server';

import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    await api.post('restore/confirmed', {
      tokenId: formData.get('tokenId'),
      token: formData.get('code'),
    });

    return {
      success: true,
      message: 'Código confirmado com sucesso',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
