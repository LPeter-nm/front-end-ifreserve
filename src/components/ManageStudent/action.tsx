import { api } from '@/app/server/api';

export async function getStudents(formData: FormData) {
  try {
    const token = formData.get('token');
    const page = Number(formData.get('page')) || 1;
    const pageSize = Number(formData.get('pageSize')) || 5;

    const response = await api.get(`/student/users?page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      data: response.data.data,
      totalPages: response.data.totalPages,
      currentPage: page,
      totalStudents: response.data.totalStudents || 0,
    };
  } catch (error: any) {
    return { error: error.response?.data?.message || error.message };
  }
}
