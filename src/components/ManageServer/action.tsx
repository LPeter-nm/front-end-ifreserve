import { api } from '@/app/server/api';

export async function getServers(formData: FormData) {
  try {
    const token = formData.get('token');
    const page = formData.get('page') || '1';
    const pageSize = formData.get('pageSize') || '5';

    const response = await api.get(`server/users`, {
      params: {
        page,
        pageSize,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      data: response.data.data,
      totalPages: response.data.totalPages,
      currentPage: page,
      totalServers: response.data.totalServers,
    };
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message };
  }
}
