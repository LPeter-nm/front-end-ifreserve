'use server';

import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    const response = await api.post('restore', {
      email: formData.get('email'),
    });

    const tokenId = response.data.tokenId;
    return {
      tokenId,
      success: true,
      message: 'Código enviado ao email',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
