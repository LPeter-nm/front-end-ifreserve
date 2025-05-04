import { api } from '@/app/server/api';
export async function getReserves() {
  try {
    const response = await api.get('reserve/reserves', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function confirmReserve(id: string) {
  try {
    const response = await api.patch(`reserve-sport/${id}/confirmed`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function refusedReserve(id: string) {
  try {
    const response = await api.patch(`reserve-sport/${id}/refused`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}
