import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    await api.patch('restore/new-credentials', {
      tokenId: localStorage.getItem('tokenId'),
      password: formData.get('password'),
    });

    localStorage.clear();

    return {
      success: true,
      message: 'Senha alterada com sucesso',
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
