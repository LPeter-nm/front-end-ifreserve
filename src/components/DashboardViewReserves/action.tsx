import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios

// --- Funções para Reservas (Server Actions) ---

/**
 * Busca as reservas de um usuário específico.
 * Esta função é projetada para ser uma Server Action que recebe o token
 * e, opcionalmente, outros dados via FormData para autenticação e filtragem.
 *
 * @param {FormData} formData Objeto FormData contendo o token de autenticação.
 * @returns {Promise<any | {error: string}>} Uma Promise que resolve para os dados das reservas
 * do usuário, ou um objeto de erro em caso de falha.
 */
export async function getReserves(formData: FormData): Promise<any | { error: string }> {
  try {
    const token = formData.get('token'); // Obtém o token da FormData.

    if (!token) {
      // Se o token não for fornecido, retorna um erro de autenticação.
      return { error: 'Token de autenticação ausente.' };
    }

    // Realiza uma requisição GET para o endpoint de reservas do usuário.
    // O token é enviado no cabeçalho 'Authorization'.
    const response = await api.get('reserve/reserves-user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // Boa prática para requisições com corpo, mesmo para GET.
      },
    });

    // Retorna os dados da resposta, que devem ser as reservas do usuário.
    return response.data;
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // A mensagem de erro é logada para depuração e retornada ao chamador.
    console.error('Erro ao buscar reservas do usuário:', error.message);
    return { error: error.message || 'Erro ao buscar reservas do usuário' };
  }
}

// --- Funções para Relatórios (Server Actions) ---

/**
 * Busca os relatórios associados a um ID de usuário específico.
 * Esta função é projetada para ser uma Server Action, recebendo o token
 * e o ID do usuário via FormData para autenticação e filtragem.
 *
 * @param {FormData} formData Objeto FormData contendo o token de autenticação e o ID do usuário.
 * @returns {Promise<any | {error: string}>} Uma Promise que resolve para os dados dos relatórios
 * do usuário, ou um objeto de erro em caso de falha.
 */
export async function getReports(formData: FormData): Promise<any | { error: string }> {
  try {
    const token = formData.get('token'); // Obtém o token da FormData.

    if (!token) {
      return { error: 'Token de autenticação ausente.' };
    }

    // Realiza uma requisição GET para o endpoint de relatórios do usuário.
    // O ID do usuário é parte da URL da rota (ex: 'report/reports/123').
    const response = await api.get(`report/reports-user`, {
      headers: {
        Authorization: `Bearer ${token}`, // O token é enviado no cabeçalho 'Authorization'.
      },
    });

    // Retorna os dados da resposta, que devem ser os relatórios do usuário.
    return response.data;
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // A mensagem de erro é logada para depuração e retornada ao chamador.
    console.error(
      `Erro ao buscar relatórios para o usuário ${formData.get('userId')}:`,
      error.message
    );
    return { error: error.message || 'Erro ao buscar relatórios' };
  }
}
