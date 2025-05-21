import { api } from '@/app/server/api';

export async function handleSubmit(formData: FormData, sportId: string) {
  try {
    const date = new Date(formData.get('dateUsed') as string);
    const token = formData.get('token');
    const requestData = {
      nameUser: formData.get('nameUser'),
      requestedEquipment: formData.get('requestedEquipment'),
      peopleAppear: formData.get('peopleAppear'),
      generalComments: formData.get('generalComment'),
      courtCondition: formData.get('courtCondition'),
      equipmentCondition: formData.get('equipmentCondition'),
      timeUsed: formData.get('timeUsed'),
      dateUsed: date,
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
