// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador (como `localStorage`).
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão do código de verificação para restauração de senha.
 * Esta função envia o `tokenId` e o `código` (token de verificação) para a API.
 *
 * @param {FormData} formData Objeto FormData contendo 'tokenId' e 'code'.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 * Uma Promise que resolve com um objeto indicando sucesso ou falha, e a mensagem relevante.
 */
export async function handleSubmit(
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Extrai o 'tokenId' e o 'code' (código de verificação) do FormData.
    const tokenId = formData.get('tokenId');
    const code = formData.get('code');

    // Validação básica: verifica se os dados necessários estão presentes.
    if (!tokenId || typeof tokenId !== 'string') {
      return { success: false, error: 'Token de identificação da sessão ausente ou inválido.' };
    }
    if (!code || typeof code !== 'string') {
      return { success: false, error: 'Código de verificação ausente ou inválido.' };
    }

    // Faz uma requisição POST para a API para confirmar o código.
    // O endpoint 'restore/confirmed' presumivelmente verifica a validade do `code`
    // em relação ao `tokenId` no backend.
    await api.post('restore/confirmed', {
      tokenId: tokenId,
      token: code, // O backend espera o campo 'token' para o código de verificação.
    });

    // Se a requisição for bem-sucedida (sem lançar erro), retorna sucesso.
    return {
      success: true,
      message: 'Código confirmado com sucesso.',
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Loga o erro para depuração no servidor.
    console.error('Erro ao confirmar código de recuperação de senha:', error.message);
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: error.message || 'Erro ao confirmar código.' };
  }
}
