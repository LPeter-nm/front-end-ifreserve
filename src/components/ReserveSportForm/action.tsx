'use server';
import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData) {
  try {
    const requestData = {
      type_Practice: formData.get('type_Practice'),
      number_People: Number(formData.get('number_People')),
      request_Equipment: formData.get('request_Equipment'),
      participants: formData.get('participants'),
      ocurrence: formData.get('ocurrence'),
      date_Start: formData.get('date_Start'),
      date_End: formData.get('date_End'),
      hour_Start: formData.get('hour_Start'),
      hour_End: formData.get('hour_End'),
    }; // Para debug

    const response = await api.post('reserve-sport/request', requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Reserva solicitada com sucesso',
      data: response.data,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
