import { api } from '@/app/server/api';

export async function deleteExternal(userId: string, token: string) {
  try {
    const response = await api.delete(`user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message };
  }
}
