'use server';
import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    const token = formData.get('token');
    const requestData = {
      typePractice: formData.get('typePractice'),
      numberParticipants: Number(formData.get('numberParticipants')),
      requestEquipment: formData.get('requestEquipment'),
      participants: formData.get('participants'),
      occurrence: formData.get('occurrence'),
      dateTimeStart: formData.get('dateTimeStart'),
      dateTimeEnd: formData.get('dateTimeEnd'),
    }; // Para debug

    const response = await api.post('reserve-sport/request', requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Reserva solicitada com sucesso',
      data: response.data.reserveRequest,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
