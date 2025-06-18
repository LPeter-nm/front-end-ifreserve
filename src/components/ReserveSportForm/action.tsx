// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão de uma solicitação de reserva esportiva, incluindo um possível upload de PDF.
 * Esta Server Action envia os dados da reserva e o arquivo PDF (se presente) para a API.
 *
 * @param {FormData} formData Objeto FormData contendo os dados da reserva e o token de autenticação.
 * Deve incluir 'token' e opcionalmente 'pdfFile'.
 * @returns {Promise<{success: boolean, message?: string, data?: any, error?: string}>}
 * Uma Promise que resolve para um objeto indicando sucesso ou falha, e os dados/mensagem relevantes.
 */
export async function handleSubmit(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}> {
  try {
    // Extrai o token e o arquivo PDF do FormData antes de extrair outros dados.
    const token = formData.get('token') as string | null;
    // Removendo o pdfFile do formData principal para evitar problemas de duplicação
    // ou Content-Type misturado na primeira requisição, se o backend espera JSON para os dados principais.
    const pdfFile = formData.get('pdfFile') as File | null;
    formData.delete('pdfFile'); // Remove o PDF para não ser enviado na primeira requisição como parte do JSON

    // Validação básica no servidor: verifica se o token está presente.
    if (!token) {
      return { success: false, error: 'Token de autenticação ausente. Faça login novamente.' };
    }

    // `formData` já é um objeto `FormData` que `api.post` (Axios) pode enviar como `multipart/form-data`.
    // Os dados já foram anexados no cliente. Não precisamos recriar `requestData` como um objeto JSON aqui
    // se o backend espera `multipart/form-data` para todos esses campos.
    // Se o backend espera JSON para os dados principais e `multipart/form-data` para o PDF,
    // o cliente deve enviar o JSON e o PDF separadamente, ou a Server Action deve construir um novo FormData
    // com apenas o PDF.

    // ASSUMINDO que o backend `reserve-sport/request` espera um `multipart/form-data`
    // que já contém todos os campos (typePractice, numberParticipants, etc.) e o token:
    const response = await api.post('reserve-sport/request', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // **IMPORTANTE:** Não defina 'Content-Type': 'application/json' aqui se estiver enviando FormData.
        // Axios e o navegador o farão automaticamente e corretamente como 'multipart/form-data'.
      },
    });

    // Se houver um PDF e a primeira requisição foi bem-sucedida (retornou um ID, por exemplo),
    // prossegue com o upload do PDF.
    if (pdfFile && response.data?.id) {
      const pdfFormData = new FormData();
      pdfFormData.append('pdfFile', pdfFile); // Cria um novo FormData apenas para o PDF.

      await api.patch(`reserve-sport/${response.data.id}/upload`, pdfFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Axios cuidará do Content-Type como 'multipart/form-data' aqui.
        },
      });
      console.log('PDF enviado com sucesso.');
    }

    return {
      success: true,
      message: response.data?.message || 'Reserva solicitada com sucesso!',
      data: response.data, // Retorna os dados da resposta principal
    };
  } catch (error: any) {
    // Captura erros da requisição, extrai a mensagem e retorna um objeto de erro.
    // Detalhes do erro para depuração no servidor.
    console.error('Erro detalhado na Server Action de solicitação de reserva esportiva:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Retorna a mensagem de erro mais específica para o frontend.
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Erro ao processar a requisição.',
    };
  }
}
