// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Busca uma lista paginada de usuários servidores do backend.
 * Esta Server Action recebe o token de autenticação e os parâmetros de paginação (página e tamanho da página).
 *
 * @param {FormData} formData Objeto FormData contendo 'token', 'page' (opcional, padrão '1'), e 'pageSize' (opcional, padrão '5').
 * @returns {Promise<{data?: any[], totalPages?: number, currentPage?: string, totalServers?: number, error?: string}>}
 * Uma Promise que resolve para um objeto contendo os dados dos usuários, informações de paginação, ou uma mensagem de erro.
 */
export async function getServers(formData: FormData): Promise<{
  data?: any[];
  totalPages?: number;
  currentPage?: string;
  totalServers?: number;
  error?: string;
}> {
  try {
    // Extrai o token e os parâmetros de paginação do objeto FormData.
    const token = formData.get('token');
    const page = formData.get('page')?.toString() || '1'; // Converte para string e define padrão '1'.
    const pageSize = formData.get('pageSize')?.toString() || '5'; // Converte para string e define padrão '5'.

    // Validação básica no servidor: verifica se o token está presente.
    if (!token || typeof token !== 'string') {
      return { error: 'Token de autenticação ausente. Faça login novamente.' };
    }

    // Faz uma requisição GET para o endpoint de usuários servidores.
    // Os parâmetros de paginação são enviados como `params` na requisição Axios.
    const response = await api.get(`server/users`, {
      params: {
        page,
        pageSize,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token de autenticação no cabeçalho.
        'Content-Type': 'application/json', // Boa prática, mesmo para requisições GET com corpo vazio.
      },
    });

    // Retorna os dados, total de páginas, página atual e total de usuários, extraídos da resposta da API.
    return {
      data: response.data.data, // Assumindo que os dados da lista estão em `response.data.data`.
      totalPages: response.data.totalPages,
      currentPage: page, // Retorna a página que foi solicitada.
      totalServers: response.data.totalServers, // Assumindo que o total de servidores está em `response.data.totalServers`.
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro na Server Action ao buscar usuários servidores:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { error: errorMessage };
  }
}
