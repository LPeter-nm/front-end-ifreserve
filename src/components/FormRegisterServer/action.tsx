// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor e não têm acesso direto ao DOM do navegador.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.

/**
 * Lida com a submissão do formulário de registro de servidor.
 * Esta Server Action envia os dados do novo servidor para o endpoint de registro na API.
 *
 * @param {FormData} formData Objeto FormData contendo os dados do formulário (nome, matrícula, função na instituição, email, senha).
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 * Uma Promise que resolve com um objeto indicando sucesso ou falha, e a mensagem relevante.
 */
export async function handleSubmit(
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Extrai os campos do objeto FormData.
    const name = formData.get('name');
    const identification = formData.get('identification');
    const roleInInstitution = formData.get('roleInInstitution');
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação básica no servidor: verifica se os campos essenciais estão presentes e são strings.
    // Embora o cliente valide, esta é uma camada de segurança essencial.
    if (
      !name ||
      typeof name !== 'string' ||
      !identification ||
      typeof identification !== 'string' ||
      !roleInInstitution ||
      typeof roleInInstitution !== 'string' ||
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos.' };
    }

    // Faz uma requisição POST para o endpoint de registro de servidor da API.
    // Os dados são enviados no corpo da requisição.
    await api.post('server/register', {
      name,
      identification,
      roleInInstitution,
      email,
      password,
    });

    // Se a requisição for bem-sucedida (sem lançar erro), retorna sucesso.
    return {
      success: true,
      message: 'Cadastro realizado com sucesso!',
    };
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro na Server Action de registro de servidor:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return { success: false, error: errorMessage };
  }
}
