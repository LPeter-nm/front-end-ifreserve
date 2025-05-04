import { api } from '@/app/server/api';

export async function getReservesAcepted() {
  try {
    const response = await api.get('reserve-sport/reserves');

    return response.data;
  } catch (error: any) {}
}
