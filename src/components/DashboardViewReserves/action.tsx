import { api } from '@/app/server/api';
export async function getReserves(formData: FormData) {
  try {
    const token = formData.get('token');
    const response = await api.get('reserve/reserves-user', {
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

export async function getReports(formData: FormData) {
  try {
    const token = formData.get('token');

    const response = await api.get('report/reports', {
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
