import { api } from '@/app/server/api';
export async function getReserves(formData: FormData) {
  try {
    const token = formData.get('token');
    const response = await api.get('reserve/reserves', {
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

export async function confirmReserve(formData: FormData, id: string, comment?: string) {
  try {
    const token = formData.get('token');
    const response = await api.patch(
      `reserve/${id}/confirmed`,
      { comment }, // Envia o comentário no corpo da requisição
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      }
    );
    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function refusedReserve(formData: FormData, id: string, comment?: string) {
  try {
    const token = formData.get('token');
    const response = await api.patch(
      `reserve/${id}/refused`,
      { comment }, // Envia o comentário no corpo da requisição
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}
