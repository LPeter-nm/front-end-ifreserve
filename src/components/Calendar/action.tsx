import { api } from '@/app/server/api';

export async function getReservesAcepted(): Promise<any> {
  try {
    // Faz chamadas para todos os tipos de reserva
    const response = await api.get('reserve/reserves');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reserves:', error.message);
    return [];
  }
}
