import { api } from '@/app/server/api';

export async function updateReserve(id: string, route: string, data: any) {
  try {
    const token = await localStorage.getItem('token');
    console.log(id);
    const response = await api.patch(`${route}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data.updatedReserve, message: response.data.message };
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar reserva' };
  }
}

export async function getReserveDetails(id: string, route: string) {
  try {
    const response = await api.get(`${route}/${id}`);
    return {
      data: response.data,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
