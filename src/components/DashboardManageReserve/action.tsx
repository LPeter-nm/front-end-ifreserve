import { api } from '@/app/server/api';

// Funções para Reservas
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

export async function confirmReserve(formData: FormData, id: string, comment?: string) {
  try {
    const token = formData.get('token');
    const response = await api.patch(
      `reserve/${id}/confirmed`,
      { comment },
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

export async function refusedReserve(formData: FormData, id: string, comment?: string) {
  try {
    const token = formData.get('token');
    const response = await api.patch(
      `reserve/${id}/refused`,
      { comment },
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

export async function removeReserve(formData: FormData, route: string, id: string) {
  try {
    const token = formData.get('token');
    const response = await api.delete(`reserve/${id}`, {
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

// Funções para Relatórios
export async function getReports(formData: FormData) {
  try {
    const token = formData.get('token');
    const response = await api.get('report/reports', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateReport(formData: FormData, reportId: string, body: any) {
  try {
    const token = formData.get('token');
    const response = await api.patch(`report/${reportId}`, body, {
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

export async function validateReport(formData: FormData, reportId: string) {
  try {
    const token = formData.get('token');
    const response = await api.patch(
      `report/status/${reportId}`,
      {},
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

export async function removeReport(formData: FormData, reportId: string) {
  try {
    const token = formData.get('token');
    const response = await api.delete(`report/${reportId}`, {
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
