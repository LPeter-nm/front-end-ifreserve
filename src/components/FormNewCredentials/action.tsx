// Define que todas as funções neste arquivo são Server Actions.
// Elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão das novas credenciais (senha) para restauração de senha.
 * Esta Server Action recebe a nova senha e um `tokenId` (identificador da sessão de recuperação)
 * para atualizar a senha do usuário no backend.
 *
 * @param {FormData} formData Objeto FormData contendo 'password' e 'tokenId'.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 * Uma Promise que resolve com um objeto indicando sucesso ou falha, e a mensagem relevante.
 */
export async function handleSubmit(
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Extrai a nova senha e o tokenId do objeto FormData.
    const password = formData.get('password');
    const tokenId = formData.get('tokenId');

    // Validação básica no servidor: verifica se os dados necessários estão presentes.
    // Embora o cliente valide, esta é uma camada de segurança essencial.
    if (!password || typeof password !== 'string' || password.length < 8) {
      // Adicionei validação de tamanho básico aqui
      return {
        success: false,
        error: 'A nova senha é obrigatória e deve ter no mínimo 8 caracteres.',
      };
    }
    if (!tokenId || typeof tokenId !== 'string') {
      return { success: false, error: 'Token de identificação da sessão ausente ou inválido.' };
    }

    // Faz uma requisição PATCH para a API para atualizar a senha com as novas credenciais.
    // O endpoint 'restore/new-credentials' presumivelmente usa o `tokenId` para identificar
    // a sessão de recuperação e o usuário correspondente, e a `password` para a atualização.
    await api.patch('restore/new-credentials', {
      tokenId: tokenId,
      password: password,
    });

    // Se a requisição for bem-sucedida (sem lançar erro), retorna sucesso.
    return {
      success: true,
      message: 'Senha alterada com sucesso.',
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro no handleSubmit da Server Action de novas credenciais:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: errorMessage };
  }
}
