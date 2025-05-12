import { api } from '@/app/server/api';

export async function submitEventReserve(formData: FormData) {
  try {
    const token = formData.get('token');
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      location: formData.get('location'),
      occurrence: formData.get('occurrence'),
      dateTimeStart: formData.get('dateTimeStart'),
      dateTimeEnd: formData.get('dateTimeEnd'),
    };

    const response = await api.post('reserve-event', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: response.data.message,
      responseData: response.data.reserve | response.data.updateRegistered,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
