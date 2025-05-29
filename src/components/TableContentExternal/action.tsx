// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Deleta um usuário externo do backend.
 * Esta Server Action recebe o ID do usuário a ser excluído e o token de autenticação.
 *
 * @param {string} userId O ID único do usuário a ser deletado.
 * @param {string} token O token de autenticação do usuário logado (geralmente um administrador).
 * @returns {Promise<{success: boolean, error?: string}>}
 * Uma Promise que resolve para um objeto indicando sucesso ou falha, e a mensagem de erro se houver.
 */
export async function deleteUser(
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validação básica no servidor: verifica se o userId e o token estão presentes.
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'ID do usuário ausente ou inválido para exclusão.' };
    }
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Token de autenticação ausente. Faça login novamente.' };
    }

    // Faz uma requisição DELETE para o endpoint do usuário.
    // Presumimos que 'user/:userId' é a rota para deletar um usuário genérico (incluindo externos).
    await api.delete(`user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token de autenticação no cabeçalho.
      },
    });

    // Se a requisição for bem-sucedida (sem lançar erro), retorna sucesso.
    return { success: true };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Erro na Server Action ao deletar usuário ${userId}:`, errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: errorMessage };
  }
}
