import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios

// --- Funções para Reservas (Server Actions) ---

/**
 * Busca todas as reservas.
 * @param {FormData} formData Contém o token de autenticação.
 * @returns {Promise<any | {error: string}>} Retorna os dados das reservas ou um objeto de erro.
 */
export async function getReserves(formData: FormData): Promise<any | { error: string }> {
  try {
    const token = formData.get('token'); // Obtém o token da FormData.

    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }

    const response = await api.get('reserve/reserves', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar reservas:', error.message);
    return { error: error.message || 'Erro ao buscar reservas' };
  }
}

/**
 * Atualiza os detalhes de uma reserva específica.
 * @param {string} id O ID da reserva a ser atualizada.
 * @param {string} route A rota da API para o tipo de reserva.
 * @param {string} data JSON string dos dados a serem enviados.
 * @param {string} token O token de autenticação, passado do cliente.
 * @returns {Promise<{success: boolean, data?: any, message?: string, error?: string}>}
 */
export async function updateReserve(
  id: string,
  route: string,
  data: string,
  token: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    if (!token) {
      return { success: false, error: 'Token de autenticação ausente.' };
    }
    // console.log(id); // Para depuração, pode ser removido

    const response = await api.patch(`${route}/${id}`, JSON.parse(data), {
      // Analisa a string JSON de volta para objeto
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data.updatedReserve, message: response.data.message };
  } catch (error: any) {
    console.error(`Erro ao atualizar reserva ${id} na rota ${route}:`, error.message);
    return { success: false, error: error.message || 'Erro ao atualizar reserva' };
  }
}

/**
 * Obtém os detalhes de uma reserva específica.
 * NOTA: Esta função não está sendo usada no DashboardManageReserve, mas se for,
 * pode precisar de um token ou ajuste similar.
 * @param {string} id O ID da reserva.
 * @param {string} route A rota da API para o tipo de reserva.
 * @returns {Promise<{data?: any, error?: string}>}
 */
export async function getReserveDetails(
  id: string,
  route: string
): Promise<{ data?: any; error?: string }> {
  try {
    const response = await api.get(`${route}/${id}`);
    return { data: response.data };
  } catch (error: any) {
    console.error(`Erro ao obter detalhes da reserva ${id} na rota ${route}:`, error.message);
    return { error: error.message || 'Erro ao obter detalhes da reserva' };
  }
}

/**
 * Confirma uma reserva.
 * @param {FormData} formData Contém o token e comentários.
 * @param {string} id O ID da reserva a ser confirmada.
 * @param {string | undefined} comments Comentários opcionais para a confirmação.
 * @returns {Promise<any | {error: string}>}
 */
export async function confirmReserve(
  formData: FormData,
  id: string,
  comments?: string
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.patch(
      `reserve/${id}/confirmed`,
      { comments },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao confirmar reserva ${id}:`, error.message);
    return { error: error.message || 'Erro ao confirmar reserva' };
  }
}

/**
 * Recusa uma reserva.
 * @param {FormData} formData Contém o token e comentários.
 * @param {string} id O ID da reserva a ser recusada.
 * @param {string | undefined} comments Comentários opcionais para a recusa.
 * @returns {Promise<any | {error: string}>}
 */
export async function refusedReserve(
  formData: FormData,
  id: string,
  comments?: string
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.patch(
      `reserve/${id}/refused`,
      { comments },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao recusar reserva ${id}:`, error.message);
    return { error: error.message || 'Erro ao recusar reserva' };
  }
}

/**
 * Remove uma reserva.
 * @param {FormData} formData Contém o token.
 * @param {string} route A rota da API (não usada no endpoint, mas mantida por consistência se a rota no cliente precisar).
 * @param {string} id O ID da reserva a ser removida.
 * @returns {Promise<any | {error: string}>}
 */
export async function removeReserve(
  formData: FormData,
  route: string,
  id: string
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.delete(`reserve/${id}`, {
      // Endpoint parece ser direto '/reserve/:id'
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao remover reserva ${id}:`, error.message);
    return { error: error.message || 'Erro ao remover reserva' };
  }
}

// --- Funções para Relatórios (Server Actions) ---

/**
 * Busca todos os relatórios.
 * @param {FormData} formData Contém o token e o ID do usuário (opcionalmente para filtrar).
 * @returns {Promise<any | {error: string}>}
 */
export async function getReports(formData: FormData): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    const userId = formData.get('id'); // ID do usuário pode ser usado para filtrar no backend

    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }

    const response = await api.get('report/reports', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: userId ? { userId } : {}, // Adiciona userId como parâmetro de query se existir
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar relatórios:', error.message);
    return { error: error.message || 'Erro ao buscar relatórios' };
  }
}

/**
 * Atualiza um relatório.
 * @param {FormData} formData Contém o token.
 * @param {string} reportId O ID do relatório a ser atualizado.
 * @param {any} body Os dados de atualização do relatório.
 * @returns {Promise<any | {error: string}>}
 */
export async function updateReport(
  formData: FormData,
  reportId: string,
  body: any
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.patch(`report/${reportId}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao atualizar relatório ${reportId}:`, error.message);
    return { error: error.message || 'Erro ao atualizar relatório' };
  }
}

/**
 * Valida um relatório (muda seu status).
 * @param {FormData} formData Contém o token.
 * @param {string} reportId O ID do relatório a ser validado.
 * @returns {Promise<any | {error: string}>}
 */
export async function validateReport(
  formData: FormData,
  reportId: string
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    const commentsAdmin = formData.get('commentsAdmin');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.patch(
      `report/status/${reportId}`,
      { commentsAdmin }, // Corpo vazio para PATCH, se o status é inferido pela rota.
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao validar relatório ${reportId}:`, error.message);
    return { error: error.message || 'Erro ao validar relatório' };
  }
}

/**
 * Remove um relatório.
 * @param {FormData} formData Contém o token.
 * @param {string} reportId O ID do relatório a ser removido.
 * @returns {Promise<any | {error: string}>}
 */
export async function removeReport(
  formData: FormData,
  reportId: string
): Promise<any | { error: string }> {
  try {
    const token = formData.get('token');
    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }
    const response = await api.delete(`report/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao remover relatório ${reportId}:`, error.message);
    return { error: error.message || 'Erro ao remover relatório' };
  }
}
