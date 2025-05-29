// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Inicia o processo de recuperação de senha enviando um código para o email do usuário.
 * Esta Server Action recebe o email do usuário, envia uma requisição para a API
 * e retorna um `tokenId` para as etapas subsequentes da recuperação.
 *
 * @param {FormData} formData Objeto FormData contendo o 'email' do usuário.
 * @returns {Promise<{success: boolean, tokenId?: string, message?: string, error?: string}>}
 * Uma Promise que resolve com um objeto indicando sucesso ou falha, e os dados/mensagem relevantes.
 */
export async function handleSubmit(
  formData: FormData
): Promise<{ success: boolean; tokenId?: string; message?: string; error?: string }> {
  try {
    // Extrai o email do objeto FormData.
    const email = formData.get('email');

    // Validação básica no servidor: verifica se o email foi fornecido e é uma string.
    // Embora o cliente valide, esta é uma camada de segurança essencial.
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'O email é obrigatório para iniciar a recuperação de senha.',
      };
    }

    // Faz uma requisição POST para o endpoint 'restore' da API.
    // Assumimos que o backend envia o código para o email e retorna um `tokenId`.
    const response = await api.post('restore', {
      email: email,
    });

    const tokenId = response.data.tokenId;

    // Verifica se um `tokenId` foi realmente retornado pela API.
    if (!tokenId || typeof tokenId !== 'string') {
      console.error('API não retornou um tokenId válido no início da recuperação de senha.');
      return {
        success: false,
        error: 'Falha ao iniciar recuperação de senha: ID de sessão não recebido.',
      };
    }

    // Se a requisição for bem-sucedida e um `tokenId` for recebido, retorna sucesso.
    return {
      tokenId: tokenId, // Retorna o tokenId para o componente cliente.
      success: true,
      message: 'Código enviado ao email com sucesso.',
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error(
      'Erro na Server Action de envio de código de recuperação de senha:',
      errorMessage
    );
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: errorMessage };
  }
}
