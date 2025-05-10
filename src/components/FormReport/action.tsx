import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData, sportId: string) {
  try {
    const date = new Date(formData.get('date_Used') as string);
    const token = formData.get('token');
    const requestData = {
      name_User: formData.get('nameUser'),
      requested_Equipment: formData.get('requestedEquipment'),
      people_Appear: formData.get('peopleAppear'),
      description: formData.get('description'),
      description_Court: formData.get('description_Court'),
      description_Equipment: formData.get('description_Equipment'),
      time_Used: formData.get('time_Used'),
      date_Used: date,
    };

    const response = await api.post(`report/${sportId}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}
