import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData, userId: string, email: string) {
  try {
    const identification = formData.get('identification');
    const password = formData.get('password');
    const phone = formData.get('phone');
    const address = formData.get('address');

    await api.post(`user-external/complete-register/${userId}?email=${email}`, {
      identification,
      password,
      phone,
      address,
    });

    return {
      success: true,
      message: 'Cadastro com google realizado com sucesso',
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro no handleSubmit da Server Action de login:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return {
      success: false,
      error: errorMessage,
    };
  }
}
