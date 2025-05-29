// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Busca uma lista paginada de usuários estudantes do backend.
 * Esta Server Action recebe o token de autenticação e os parâmetros de paginação (página e tamanho da página).
 *
 * @param {FormData} formData Objeto FormData contendo 'token', 'page' (opcional, padrão '1'), e 'pageSize' (opcional, padrão '5').
 * @returns {Promise<{data?: any[], totalPages?: number, currentPage?: number, totalStudents?: number, error?: string}>}
 * Uma Promise que resolve para um objeto contendo os dados dos usuários, informações de paginação, ou uma mensagem de erro.
 */
export async function getStudents(formData: FormData): Promise<{
  data?: any[];
  totalPages?: number;
  currentPage?: number;
  totalStudents?: number;
  error?: string;
}> {
  try {
    // Extrai o token e os parâmetros de paginação do objeto FormData.
    const token = formData.get('token');
    // Converte 'page' e 'pageSize' para números, definindo valores padrão se ausentes.
    const page = Number(formData.get('page')) || 1;
    const pageSize = Number(formData.get('pageSize')) || 5;

    // Validação básica no servidor: verifica se o token está presente.
    if (!token || typeof token !== 'string') {
      return { error: 'Token de autenticação ausente. Faça login novamente.' };
    }

    // Faz uma requisição GET para o endpoint de usuários estudantes.
    // Os parâmetros de paginação são incluídos diretamente na string da URL para clareza (Axios também aceita um objeto `params`).
    const response = await api.get(`/student/users?page=${page}&pageSize=${pageSize}`, {
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
      totalStudents: response.data.totalStudents || 0, // Assumindo que o total de estudantes está em `response.data.totalStudents`.
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro na Server Action ao buscar usuários estudantes:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { error: errorMessage };
  }
}
