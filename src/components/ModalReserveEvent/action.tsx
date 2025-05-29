// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão de uma nova reserva de evento.
 * Esta Server Action recebe os dados do formulário de evento (nome, descrição, localização, ocorrência, datas)
 * e o token de autenticação, enviando-os para o endpoint de reserva de evento na API.
 *
 * @param {FormData} formData Objeto FormData contendo os dados da reserva e o token de autenticação.
 * @returns {Promise<{success: boolean, message?: string, responseData?: any, error?: string}>}
 * Uma Promise que resolve para um objeto indicando sucesso ou falha, e os dados/mensagem relevantes.
 */
export async function submitEventReserve(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  responseData?: any;
  error?: string;
}> {
  try {
    // Extrai o token e os dados da reserva do objeto FormData.
    const token = formData.get('token');
    const name = formData.get('name');
    const description = formData.get('description');
    const location = formData.get('location');
    const occurrence = formData.get('occurrence');
    const dateTimeStart = formData.get('dateTimeStart'); // Data formatada como string
    const dateTimeEnd = formData.get('dateTimeEnd'); // Data formatada como string

    // Validação básica no servidor: verifica se os dados essenciais estão presentes e são strings.
    if (
      !token ||
      typeof token !== 'string' ||
      !name ||
      typeof name !== 'string' ||
      !description ||
      typeof description !== 'string' ||
      !location ||
      typeof location !== 'string' ||
      !occurrence ||
      typeof occurrence !== 'string' ||
      !dateTimeStart ||
      typeof dateTimeStart !== 'string' ||
      !dateTimeEnd ||
      typeof dateTimeEnd !== 'string'
    ) {
      return {
        success: false,
        error: 'Todos os campos obrigatórios da reserva de evento devem ser preenchidos.',
      };
    }

    // Constrói o objeto de dados a ser enviado para a API.
    // As datas já vêm formatadas do cliente, mas o backend pode preferir ISO strings.
    // Certifique-se de que `dateTimeStart` e `dateTimeEnd` estejam no formato correto para o backend.
    const requestData = {
      name,
      description,
      location,
      occurrence,
      dateTimeStart, // Passa a string formatada
      dateTimeEnd, // Passa a string formatada
    };

    // Faz uma requisição POST para o endpoint de reserva de evento.
    const response = await api.post('reserve-event', requestData, {
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token de autenticação no cabeçalho.
        'Content-Type': 'application/json', // Especifica o tipo de conteúdo como JSON.
      },
    });

    // Retorna um objeto de sucesso com a mensagem e os dados da resposta da API.
    // O operador `||` (OR lógico) é usado para retornar o primeiro valor verdadeiro entre `reserve` e `updateRegistered`.
    return {
      success: true,
      message: response.data.message || 'Reserva de evento processada com sucesso.',
      responseData: response.data.reserve || response.data.updateRegistered,
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro na Server Action de submissão de reserva de evento:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: errorMessage };
  }
}
