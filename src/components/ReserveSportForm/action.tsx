'use server';
import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const pdfFile = formData.get('pdfFile') as File | null;

    const requestData = {
      typePractice: formData.get('typePractice'),
      numberParticipants: Number(formData.get('numberParticipants')),
      requestEquipment: formData.get('requestEquipment'),
      participants: formData.get('participants'),
      occurrence: formData.get('occurrence'),
      dateTimeStart: formData.get('dateTimeStart'),
      dateTimeEnd: formData.get('dateTimeEnd'),
    };

    console.log('Dados sendo enviados:', requestData);

    const response = await api.post('reserve-sport/request', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (pdfFile && response.data.id) {
      const fileFormData = new FormData();
      fileFormData.append('pdfFile', pdfFile);

      await api.patch(`reserve-sport/${response.data.id}/upload`, fileFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    console.log('Resposta da API:', response); // Debug

    return {
      success: true,
      message: 'Reserva solicitada com sucesso',
      data: response.data,
    };
  } catch (error: any) {
    console.error('Erro detalhado:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Retorne o erro de forma que o frontend possa exibir
    return {
      error: error.response?.data?.message || error.message || 'Erro ao processar a requisição',
    };
  }
}
