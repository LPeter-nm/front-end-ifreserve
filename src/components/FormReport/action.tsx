// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão do formulário de relatório de uso para uma reserva esportiva.
 * Esta Server Action recebe os dados do relatório e o ID do esporte, enviando-os para a API.
 *
 * @param {FormData} formData Objeto FormData contendo os dados do relatório (incluindo o token de autenticação).
 * @param {string} sportId O ID único do esporte ao qual este relatório está associado.
 * @returns {Promise<any | {error: string}>}
 * Uma Promise que resolve para os dados de resposta da API em caso de sucesso, ou um objeto de erro em caso de falha.
 */
export async function handleSubmit(
  formData: FormData,
  sportId: string
): Promise<any | { error: string }> {
  try {
    // Extrai o token e os dados do relatório do objeto FormData.
    const token = formData.get('token');
    const nameUser = formData.get('nameUser');
    const requestedEquipment = formData.get('requestedEquipment');
    const peopleAppear = formData.get('peopleAppear');
    const generalComments = formData.get('generalComments'); // Corrigido de 'generalComment'
    const courtCondition = formData.get('courtCondition');
    const equipmentCondition = formData.get('equipmentCondition');
    const timeUsed = formData.get('timeUsed');
    const dateUsedString = formData.get('dateUsed'); // Obtém a data como string

    // Validação básica no servidor: verifica se os dados essenciais estão presentes e são strings.
    if (!token || typeof token !== 'string') {
      return { error: 'Token de autenticação ausente. Faça login novamente.' };
    }
    if (!sportId || typeof sportId !== 'string') {
      return { error: 'ID do esporte ausente para associar o relatório.' };
    }
    if (
      !nameUser ||
      typeof nameUser !== 'string' ||
      !requestedEquipment ||
      typeof requestedEquipment !== 'string' ||
      !peopleAppear ||
      typeof peopleAppear !== 'string' ||
      !courtCondition ||
      typeof courtCondition !== 'string' ||
      !equipmentCondition ||
      typeof equipmentCondition !== 'string' ||
      !timeUsed ||
      typeof timeUsed !== 'string' ||
      !dateUsedString ||
      typeof dateUsedString !== 'string'
    ) {
      return { error: 'Campos obrigatórios do relatório estão incompletos ou inválidos.' };
    }

    // Converte a string de data (ex: YYYY-MM-DD) para um objeto Date.
    // Certifique-se de que o formato da data que você envia é o que o backend espera.
    // Se o backend espera um ISO string (incluindo fuso horário), `new Date().toISOString()` é o ideal.
    const dateUsed = new Date(dateUsedString);

    // Constrói o objeto de dados a ser enviado para a API.
    const requestData = {
      nameUser,
      requestedEquipment,
      peopleAppear,
      generalComments: generalComments || '', // Garante que seja uma string, mesmo que vazia
      courtCondition,
      equipmentCondition,
      timeUsed,
      dateUsed, // Envia como objeto Date ou ISO string, dependendo do backend
    };

    // Faz uma requisição POST para o endpoint de relatório, associando-o ao `sportId`.
    const response = await api.post(`report/${sportId}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token de autenticação no cabeçalho.
        'Content-Type': 'application/json', // Especifica o tipo de conteúdo como JSON.
      },
    });

    // Retorna os dados da resposta da API em caso de sucesso.
    return response.data;
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data || error.message;
    console.error(
      `Erro na Server Action de submissão de relatório para sportId ${sportId}:`,
      errorMessage
    );
    // Retorna um objeto de erro para o componente cliente.
    return { error: errorMessage };
  }
}
